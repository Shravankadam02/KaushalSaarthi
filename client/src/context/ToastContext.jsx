import { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';

const ToastContext = createContext(null);

const STYLES = {
  success: { bg: 'bg-emerald-600', icon: FiCheckCircle },
  error: { bg: 'bg-red-600', icon: FiXCircle },
  info: { bg: 'bg-slate-800', icon: FiInfo },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-xs">
        {toasts.map((t) => {
          const style = STYLES[t.type];
          const Icon = style.icon;
          return (
            <div
              key={t.id}
              onClick={() => dismissToast(t.id)}
              className={`${style.bg} text-white text-sm rounded-lg px-4 py-3 shadow-lg flex items-start gap-2.5 cursor-pointer`}
            >
              <Icon size={16} className="shrink-0 mt-0.5" />
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}