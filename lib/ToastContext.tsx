import React, { createContext, useContext, useState, useCallback } from 'react';
import { View } from 'react-native';
import { Toast, type ToastVariant } from '@/components/ui/Toast';

interface ToastState {
  visible: boolean;
  variant: ToastVariant;
  message: string;
  description?: string;
}

interface ToastContextValue {
  toast: ToastState;
  showSuccess: (message: string, description?: string) => void;
  showError: (message: string, description?: string) => void;
  showWarning: (message: string, description?: string) => void;
  showInfo: (message: string, description?: string) => void;
  dismissToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const initialToast: ToastState = {
  visible: false,
  variant: 'info',
  message: '',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>(initialToast);

  const show = useCallback((variant: ToastVariant, message: string, description?: string) => {
    setToast({ visible: true, variant, message, description });
  }, []);

  const dismiss = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const value: ToastContextValue = {
    toast,
    showSuccess: (msg, desc) => show('success', msg, desc),
    showError: (msg, desc) => show('error', msg, desc),
    showWarning: (msg, desc) => show('warning', msg, desc),
    showInfo: (msg, desc) => show('info', msg, desc),
    dismissToast: dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        <Toast
          visible={toast.visible}
          variant={toast.variant}
          message={toast.message}
          description={toast.description}
          onDismiss={dismiss}
          duration={3000}
        />
      </View>
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: initialToast,
      showSuccess: () => {},
      showError: () => {},
      showWarning: () => {},
      showInfo: () => {},
      dismissToast: () => {},
    };
  }
  return ctx;
}
