import React from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { NotificationItem } from '../types/bpjs';

interface NotificationToastProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
  onActionClick?: (notif: NotificationItem) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
  onActionClick
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.slice(-3).map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 flex items-start gap-3 ${
            n.type === 'status_change'
              ? 'bg-amber-500 text-white border-amber-400'
              : n.type === 'urgent_task'
              ? 'bg-rose-600 text-white border-rose-500'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {n.type === 'status_change' ? (
              <Sparkles className="w-5 h-5 text-amber-100" />
            ) : n.type === 'urgent_task' ? (
              <Bell className="w-5 h-5 text-rose-200 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-xs">{n.title}</h5>
              <span className="text-[10px] opacity-80">
                {new Date(n.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-xs opacity-95 mt-0.5 leading-snug">{n.message}</p>
          </div>

          <button
            type="button"
            onClick={() => onDismiss(n.id)}
            className="text-white/70 hover:text-white shrink-0 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
