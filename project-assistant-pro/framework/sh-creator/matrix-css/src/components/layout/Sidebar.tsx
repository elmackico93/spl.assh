import React, { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onClose?: () => void;
  position?: 'left' | 'right';
  overlay?: boolean;
  width?: string;
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      children,
      isOpen = true,
      onClose,
      position = 'left',
      overlay = false,
      width = '280px',
      ...props
    },
    ref
  ) => {
    const handleOverlayClick = () => {
      if (onClose) {
        onClose();
      }
    };

    return (
      <>
        {overlay && isOpen && (
          <div
            className="fixed inset-0 bg-matrix-overlay z-40"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
        )}
        <div
          ref={ref}
          className={cn(
            'bg-matrix-panel border-matrix-border h-full overflow-y-auto transition-all duration-300 ease-in-out',
            position === 'left' ? 'border-r' : 'border-l',
            overlay ? 'fixed top-0 bottom-0 z-50' : 'relative',
            position === 'left' && overlay
              ? isOpen
                ? 'left-0'
                : '-left-full'
              : '',
            position === 'right' && overlay
              ? isOpen
                ? 'right-0'
                : '-right-full'
              : '',
            !overlay && !isOpen && 'hidden',
            className
          )}
          style={{ width }}
          {...props}
        >
          {children}
        </div>
      </>
    );
  }
);

Sidebar.displayName = 'Sidebar';

interface SidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-4 border-b border-matrix-border', className)}
        {...props}
      />
    );
  }
);

SidebarHeader.displayName = 'SidebarHeader';

interface SidebarContentProps extends HTMLAttributes<HTMLDivElement> {}

const SidebarContent = forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-4', className)}
        {...props}
      />
    );
  }
);

SidebarContent.displayName = 'SidebarContent';

interface SidebarFooterProps extends HTMLAttributes<HTMLDivElement> {}

const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-4 border-t border-matrix-border mt-auto', className)}
        {...props}
      />
    );
  }
);

SidebarFooter.displayName = 'SidebarFooter';

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter };

