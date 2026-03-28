import React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Toast = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            min-w-[320px] max-w-md p-4 flex items-center gap-3 shadow-2xl pointer-events-auto
            animate-in slide-in-from-right duration-300
            ${toast.type === 'error' ? 'bg-red-700' : 'bg-green-700'}
            text-white rounded-none
          `}
        >
          {toast.type === 'error' ? (
            <XCircle size={20} className="shrink-0" />
          ) : (
            <CheckCircle size={20} className="shrink-0" />
          )}
          
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
