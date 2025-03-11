import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;
  
  return (
    <div className="mock-dialog" data-testid="confirmation-dialog">
      <div className="mock-dialog-content">
        <h2>{title}</h2>
        <p>{description}</p>
        <div className="mock-dialog-actions">
          <button 
            onClick={onClose}
            data-testid="cancel-button"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            data-testid="confirm-button"
            className={isDestructive ? 'destructive' : ''}
            disabled={isLoading}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
} 