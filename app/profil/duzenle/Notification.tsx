import React, { useEffect } from 'react';

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose?: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose, duration = 3500 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div
      className={`mb-6 p-4 rounded-lg border text-sm shadow transition-all duration-300 ${
        type === 'success'
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-red-50 border-red-200 text-red-700'
      }`}
      role="alert"
      aria-live="polite"
    >
      {message}
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-xs underline hover:text-black focus:outline-none"
          aria-label="Kapat"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Notification;
