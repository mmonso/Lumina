import React, { useEffect, useState } from 'react';
import { Toast } from '../types';

interface ToastNotificationProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onRemove, 300); // Wait for exit animation
    }, 4000);

    return () => clearTimeout(timer);
  }, [onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-emerald-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        );
    }
  };

  return (
    <div 
      className={`
        pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border border-white/10
        bg-slate-900/80 text-white min-w-[300px] max-w-sm transition-all duration-300 transform
        ${isExiting ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0 animate-fade-in-up'}
      `}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <p className="text-sm font-medium">{toast.message}</p>
    </div>
  );
};

export default ToastNotification;