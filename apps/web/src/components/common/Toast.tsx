import { useEffect } from "react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, onDismiss, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      className="fixed bottom-4 right-4 z-50 bg-nord-frost3 text-white px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-5 duration-300"
      role="alert"
    >
      {message}
    </div>
  );
}
