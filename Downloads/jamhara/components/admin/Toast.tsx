"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div className={`a-toast ${type}`} role="alert">
      <span className="a-toast-msg">{message}</span>
      <button className="a-toast-close" onClick={onClose} aria-label="إغلاق">
        ×
      </button>
    </div>
  );
}

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        insetInlineStart: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => onRemove(t.id)} />
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function toast(message: string, type: ToastType = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }

  function remove(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return { toast, toasts, remove };
}
