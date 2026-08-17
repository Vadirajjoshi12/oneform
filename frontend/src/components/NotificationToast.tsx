import React, { useEffect } from 'react';
import { Sparkles, X, CheckCircle2 } from 'lucide-react';

interface NotificationToastProps {
  message: string | null;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl font-bold text-xs sm:text-sm flex items-center gap-3 border border-slate-800">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded-lg transition-colors ml-2 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
