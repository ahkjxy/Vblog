import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string; // Add optional className for custom styles
  hideMobileHandle?: boolean;
}

export function Modal({ isOpen, onClose, children, maxWidth = 'max-w-lg', className = '', hideMobileHandle = false }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className={`modal-content no-scrollbar ${maxWidth} ${className}`}>
        {!hideMobileHandle && (
          <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-2 lg:hidden shrink-0" />
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
