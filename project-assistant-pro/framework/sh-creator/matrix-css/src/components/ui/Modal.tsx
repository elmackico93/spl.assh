import React, { Fragment, useRef, useState, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  closeOnBackdropClick = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === backdropRef.current) {
      handleClose();
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      ref={backdropRef}
      className={cn(
        'fixed inset-0 z-50 bg-matrix-overlay backdrop-blur-sm flex items-center justify-center p-4',
        isClosing ? 'animate-fade-out' : 'animate-fade-in'
      )}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className={cn(
          'relative bg-matrix-panel border border-matrix-border rounded shadow-lg w-full max-w-md transform transition-all duration-300',
          isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
          className
        )}
      >
        {showCloseButton && (
          <button
            className="absolute top-3 right-3 text-matrix-text-dim hover:text-matrix-text-bright"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export const ModalHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => {
  return (
    <div
      className={cn('border-b border-matrix-border p-4 font-matrix-hacker', className)}
    >
      {children}
    </div>
  );
};

export const ModalBody: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => {
  return <div className={cn('p-4', className)}>{children}</div>;
};

export const ModalFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        'border-t border-matrix-border p-4 flex justify-end space-x-2',
        className
      )}
    >
      {children}
    </div>
  );
};

