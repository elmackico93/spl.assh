import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  dropdownClassName?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'left',
  className,
  dropdownClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-10 mt-2 w-48 rounded border border-matrix-border bg-matrix-panel shadow-lg',
            align === 'left' ? 'left-0' : 'right-0',
            dropdownClassName
          )}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="dropdown-menu"
        >
          {children}
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
  className,
  disabled = false,
}) => {
  return (
    <button
      className={cn(
        'block w-full text-left px-4 py-2 text-sm text-matrix-text hover:bg-matrix-bg hover:text-matrix-text-bright',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
    >
      {children}
    </button>
  );
};

export const DropdownDivider: React.FC = () => {
  return <hr className="border-t border-matrix-border my-1" />;
};

export const DropdownHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'px-4 py-2 text-xs font-semibold text-matrix-text-dim uppercase tracking-wider',
        className
      )}
    >
      {children}
    </div>
  );
};

