import { createContext, useContext } from 'react';

type ToastKind = 'success' | 'error' | 'info';
type ToastContextValue = { showToast: (message: string, kind?: ToastKind) => void };

export const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context.showToast;
};
