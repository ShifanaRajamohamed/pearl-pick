import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing,
  X, 
  Sparkles, 
  Receipt, 
  CheckCircle2, 
  Package, 
  ArrowRight,
  Check,
  Smartphone
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { pushNotificationService } from '../../services/pushNotificationService';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll?: () => void;
  onNotificationClick?: (notif: any) => void;
  onNavigateToTab?: (tab: string, id?: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNotificationClick,
  onNavigateToTab
}) => {
  const [pushEnabled, setPushEnabled] = useState<boolean>(pushNotificationService.isEnabled());
  const [permissionState, setPermissionState] = useState<string>(pushNotificationService.getPermissionStatus());

  useEffect(() => {
    if (isOpen) {
      setPushEnabled(pushNotificationService.isEnabled());
      setPermissionState(pushNotificationService.getPermissionStatus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTogglePush = async () => {
    if (!pushEnabled) {
      const perm = await pushNotificationService.requestPermission();
      setPermissionState(perm);
      pushNotificationService.setEnabled(true);
      setPushEnabled(true);
    } else {
      pushNotificationService.setEnabled(false);
      setPushEnabled(false);
    }
  };

  const handleTriggerDemoPush = async () => {
    pushNotificationService.setEnabled(true);
    setPushEnabled(true);
    await pushNotificationService.sendMilestonePushNotification({
      orderId: 'ord-8801',
      orderNumber: 'PP-IN-2026-8801',
      garmentTitle: 'Rani Zardozi Bridal Lehenga',
      tailorName: 'Ustad Rafiq Ahmed & Sons',
      tailorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      milestoneId: 'm-5',
      milestoneTitle: 'First Fitting Complete',
      status: 'COMPLETED',
      note: 'Choli baste fitting & 16-kali skirt flare verified on mannequin.',
      photoUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80'
    });
  };

  const getIcon = (type: NotificationItem['type'] | string) => {
    switch (type) {
      case 'design_ready':
        return <Sparkles className="w-4 h-4 text-[#B47B84]" />;
      case 'quote_received':
        return <Receipt className="w-4 h-4 text-[#4A3728]" />;
      case 'tailor_accepted':
      case 'ORDER_UPDATE':
        return <CheckCircle2 className="w-4 h-4 text-[#6E8765]" />;
      case 'order_delivered':
      case 'ORDER':
        return <Package className="w-4 h-4 text-[#6E8765]" />;
      default:
        return <Bell className="w-4 h-4 text-[#726761]" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-[#2D2825]/60 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-md bg-[#F9F6F2] rounded-[32px] border border-[#E4D9D1] shadow-2xl overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-white border-b border-[#E4D9D1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E9D4D7] flex items-center justify-center text-[#B47B84]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#2D2825]">Notifications & Push Alerts</h2>
              <p className="text-[11px] text-[#726761]">
                {unreadCount > 0 ? `${unreadCount} unread atelier updates` : 'All caught up'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] font-semibold text-[#B47B84] hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
            {onClearAll && notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] font-medium text-[#726761] hover:text-[#2D2825] cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#F3ECE6] text-[#2D2825] hover:bg-[#E9D4D7] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Device Push Notification Service Control Bar */}
        <div className="px-4 py-3 bg-[#FFFDF9] border-b border-[#E4D9D1] space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#FBECEF] text-[#8D2434] flex items-center justify-center shrink-0">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#2D2825]">Device Milestone Push Service</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                    pushEnabled ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {pushEnabled ? 'Active' : 'Muted'}
                  </span>
                </div>
                <p className="text-[10px] text-[#726761]">
                  Instant push alert when tailor advances a milestone ({permissionState === 'granted' ? 'Native + Banner' : 'Live Device Banner'})
                </p>
              </div>
            </div>

            <button
              onClick={handleTogglePush}
              className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer border ${
                pushEnabled
                  ? 'bg-[#2D2825] text-white border-[#2D2825]'
                  : 'bg-white text-[#2D2825] border-[#E4D9D1]'
              }`}
            >
              {pushEnabled ? 'Enabled ✓' : 'Enable Push'}
            </button>
          </div>

          <button
            id="send-test-milestone-push-btn"
            onClick={handleTriggerDemoPush}
            className="w-full py-2 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#FBECEF] border border-[#E4D9D1] hover:border-[#8D2434] text-[11px] font-semibold text-[#8D2434] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Test Push Alert: "First Fitting Complete"</span>
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-[#E4D9D1]/60">
          {notifications.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Bell className="w-8 h-8 text-[#E4D9D1] mx-auto" />
              <p className="font-serif text-sm font-bold text-[#2D2825]">No notifications yet</p>
              <p className="text-xs text-[#726761]">You'll get updates when your dress designs, quotes, or order milestones advance.</p>
            </div>
          ) : (
            notifications.map((notif: any) => (
              <div 
                key={notif.id}
                className={`py-3.5 px-3 rounded-2xl transition-all cursor-pointer ${
                  notif.isRead ? 'opacity-80 hover:bg-white/60' : 'bg-white shadow-xs border border-[#E4D9D1]/80 my-1'
                }`}
                onClick={() => {
                  onMarkAsRead(notif.id);
                  if (onNotificationClick) {
                    onNotificationClick(notif);
                  } else if (onNavigateToTab && notif.actionTab) {
                    onNavigateToTab(notif.actionTab, notif.actionId);
                    onClose();
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3ECE6] flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-[#2D2825] truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-[#726761] shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-[#726761] mt-0.5 leading-relaxed font-light">
                      {notif.message || notif.description}
                    </p>
                    {(notif.actionTab || notif.actionUrl) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8D2434] mt-2 uppercase tracking-wider">
                        <span>Track Order Milestone</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#8D2434] shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
