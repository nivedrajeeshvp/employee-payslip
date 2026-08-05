import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', isDanger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-modal">
        <div className="modal-header">
          <div className="modal-title-group">
            <AlertTriangle className={isDanger ? 'text-danger' : 'text-warning'} size={24} />
            <h3>{title}</h3>
          </div>
          <button className="close-btn" onClick={onCancel} type="button">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="secondary-button" onClick={onCancel} type="button">
            Cancel
          </button>
          <button
            className={isDanger ? 'danger-button' : 'primary-button'}
            onClick={onConfirm}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
