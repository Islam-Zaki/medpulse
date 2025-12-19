
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocalization } from './useLocalization';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string; // Changed to string for better uniqueness
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { t } = useLocalization();

  const showToast = useCallback((message: string, type: ToastType) => {
    // Use a combination of timestamp and random string to ensure uniqueness
    // even if multiple toasts are triggered in the same millisecond
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const handleForbidden = () => {
        showToast(t({ar: 'عذراً، ليس لديك صلاحية للوصول أو القيام بهذا الإجراء.', en: 'Sorry, you do not have permission to access or perform this action.'}), 'error');
    };
    window.addEventListener('medpulse-forbidden', handleForbidden);
    return () => window.removeEventListener('medpulse-forbidden', handleForbidden);
  }, [showToast, t]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-white flex justify-between items-center animate-fade-in-up ${
              toast.type === 'success' ? 'bg-med-vital-green' : toast.type === 'error' ? 'bg-red-600' : 'bg-med-tech-blue'
            }`}
          >
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="ml-4 font-bold text-white hover:text-gray-200 text-lg leading-none">&times;</button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
