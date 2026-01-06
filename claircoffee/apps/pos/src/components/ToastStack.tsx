import React, { useEffect } from "react";
import { Toast } from "@claircoffee/ui";
import { useUiStore } from "../store/ui";

export const ToastStack: React.FC = () => {
  const toasts = useUiStore((state) => state.toasts);
  const removeToast = useUiStore((state) => state.removeToast);

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => removeToast(toast.id), 4000)
    );
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [toasts, removeToast]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} variant={toast.variant} />
      ))}
    </div>
  );
};
