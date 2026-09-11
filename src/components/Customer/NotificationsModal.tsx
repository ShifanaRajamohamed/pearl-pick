import React from 'react';
import { 
  Bell, 
  X, 
  Sparkles, 
  Receipt, 
  CheckCircle2, 
  Package, 
  ArrowRight,
  Check
} from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateToTab: (tab: string, id?: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigateToTab
}) => {
  if (!isOpen) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'design_ready':
        return <Sparkles className="w-4 h-4 text-[#B47B84]" />;
      case 'quote_received':
        return <Receipt className="w-4 h-4 text-[#4A3728]" />;
      case 'tailor_accepted':
        return <CheckCircle2 className="w-4 h-4 text-[#6E8765]" />;
      case 'order_delivered':
        return <Package className="w-4 h-4 text-[#6E8765]" />;
      default:
        return <Bell className="w-4 h-4 text-[#726761]" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-[#2D2825]/60 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#F9F6F2] rounded-[32px] border border-[#E4D9D1] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-white border-b border-[#E4D9D1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E9D4D7] flex items-center justify-center text-[#B47B84]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#2D2825]">Notifications</h2>
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
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#F3ECE6] text-[#2D2825] hover:bg-[#E9D4D7] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-[#E4D9D1]/60">
          {notifications.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Bell className="w-8 h-8 text-[#E4D9D1] mx-auto" />
              <p className="font-serif text-sm font-bold text-[#2D2825]">No notifications yet</p>
              <p className="text-xs text-[#726761]">You'll get updates when your dress designs, quotes, or orders update.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`py-3.5 px-3 rounded-2xl transition-all cursor-pointer ${
                  notif.isRead ? 'opacity-80 hover:bg-white/60' : 'bg-white shadow-xs border border-[#E4D9D1]/80 my-1'
                }`}
                onClick={() => {
                  onMarkAsRead(notif.id);
                  if (notif.actionTab) {
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
                      {notif.message}
                    </p>
                    {notif.actionTab && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#B47B84] mt-2 uppercase tracking-wider">
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#B47B84] shrink-0 mt-1.5" />
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
