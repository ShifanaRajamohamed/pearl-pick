export interface MilestonePushPayload {
  id?: string;
  orderId: string;
  orderNumber?: string;
  garmentTitle: string;
  tailorName: string;
  tailorAvatar?: string;
  milestoneId: string;
  milestoneTitle: string;
  milestoneStage?: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  note?: string;
  photoUrl?: string;
  timestamp?: string;
}

export interface DevicePushNotification {
  id: string;
  title: string;
  body: string;
  orderId: string;
  milestoneId: string;
  milestoneTitle: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  tailorName: string;
  tailorAvatar?: string;
  photoUrl?: string;
  timestamp: string;
  deliveredVia: 'service-worker' | 'web-notification' | 'in-app-device-banner';
  actionTab: string;
}

type PushSubscriber = (notification: DevicePushNotification) => void;

const STORAGE_PREFS_KEY = 'pearl_pick_push_prefs_v1';
const STORAGE_HISTORY_KEY = 'pearl_pick_push_history_v1';

class PushNotificationService {
  private subscribers: Set<PushSubscriber> = new Set();
  private enabled: boolean = true;

  constructor() {
    this.loadPreferences();
  }

  private loadPreferences(): void {
    try {
      const raw = localStorage.getItem(STORAGE_PREFS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.enabled === 'boolean') {
          this.enabled = parsed.enabled;
        }
      }
    } catch {
      this.enabled = true;
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && ('Notification' in window || 'serviceWorker' in navigator);
  }

  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
    try {
      localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify({ enabled: val, updatedAt: new Date().toISOString() }));
    } catch {
      // Ignore storage quota errors
    }
  }

  public async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      if (Notification.permission === 'granted') {
        this.setEnabled(true);
        return 'granted';
      }
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        this.setEnabled(true);
      }
      return result;
    } catch {
      return Notification.permission;
    }
  }

  public subscribe(callback: PushSubscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public getPushHistory(): DevicePushNotification[] {
    try {
      const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveToHistory(notification: DevicePushNotification): void {
    try {
      const history = this.getPushHistory();
      const updated = [notification, ...history].slice(0, 25);
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Sends a real-time push notification to the customer's device when a tailor
   * advances an order milestone (e.g., 'First Fitting Complete') or uploads a milestone proof.
   */
  public async sendMilestonePushNotification(payload: MilestonePushPayload): Promise<DevicePushNotification> {
    const statusBadge = payload.status === 'COMPLETED' ? 'Complete' : 'In Progress';
    const cleanTitle = payload.milestoneTitle.replace(/\s+Ready$/i, '');
    const title = `${cleanTitle} ${statusBadge} • Order #${payload.orderNumber || payload.orderId}`;
    const body = payload.note
      ? `${payload.tailorName} updated "${payload.milestoneTitle}" for ${payload.garmentTitle}: "${payload.note}"`
      : `${payload.tailorName} marked "${payload.milestoneTitle}" as ${statusBadge.toLowerCase()} for your ${payload.garmentTitle}. Tap to view live craft progress.`;

    let deliveredVia: DevicePushNotification['deliveredVia'] = 'in-app-device-banner';

    // Attempt native Service Worker / Browser Push Notification if enabled and permitted
    if (this.enabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration && 'showNotification' in registration) {
              await registration.showNotification(title, {
                body,
                icon: payload.tailorAvatar || '/icons/icon-192x192.svg',
                badge: '/icons/icon-192x192.svg',
                tag: `milestone-${payload.orderId}-${payload.milestoneId}`,
                data: {
                  orderId: payload.orderId,
                  milestoneId: payload.milestoneId,
                  actionTab: 'orders'
                }
              });
              deliveredVia = 'service-worker';
            }
          }

          if (deliveredVia === 'in-app-device-banner') {
            new Notification(title, {
              body,
              icon: payload.tailorAvatar || '/icons/icon-192x192.svg',
              tag: `milestone-${payload.orderId}-${payload.milestoneId}`
            });
            deliveredVia = 'web-notification';
          }
        } catch {
          deliveredVia = 'in-app-device-banner';
        }
      }
    }

    const deviceNotification: DevicePushNotification = {
      id: payload.id || `push-${Date.now()}`,
      title,
      body,
      orderId: payload.orderId,
      milestoneId: payload.milestoneId,
      milestoneTitle: payload.milestoneTitle,
      status: payload.status,
      tailorName: payload.tailorName,
      tailorAvatar: payload.tailorAvatar,
      photoUrl: payload.photoUrl,
      timestamp: payload.timestamp || new Date().toISOString(),
      deliveredVia,
      actionTab: 'orders'
    };

    this.saveToHistory(deviceNotification);

    // Notify all in-app device push banner subscribers immediately
    if (this.enabled) {
      this.subscribers.forEach((cb) => cb(deviceNotification));
    }

    return deviceNotification;
  }
}

export const pushNotificationService = new PushNotificationService();
