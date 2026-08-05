import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={20} className="toast-icon success" />,
    error: <AlertCircle size={20} className="toast-icon error" />,
    info: <Info size={20} className="toast-icon info" />
  };

  return (
    <div className={`toast-notification ${toast.type || 'info'}`}>
      {icons[toast.type] || icons.info}
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={onClose} type="button">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
