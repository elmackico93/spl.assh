import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const checkboxId = id || Math.random().toString(36).substring(2, 9);

    return (
      <div className="flex items-start mb-4">
        <div className="flex items-center h-5">
          <input
            id={checkboxId}
            type="checkbox"
            className={cn(
              'w-4 h-4 bg-matrix-bg border-matrix-border rounded focus:ring-2 focus:ring-matrix-text',
              'text-matrix-text-bright cursor-pointer appearance-none checked:bg-matrix-primary',
              'relative before:absolute before:inset-0 before:bg-matrix-primary before:scale-0 checked:before:scale-100 before:transition-transform',
              'after:absolute after:top-[2px] after:left-[6px] after:w-[5px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-matrix-bg after:rotate-45 after:opacity-0 checked:after:opacity-100',
              error && 'border-matrix-danger',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        <div className="ml-3 text-sm">
          {label && (
            <label htmlFor={checkboxId} className="text-matrix-text cursor-pointer">
              {label}
            </label>
          )}
          {error && <p className="mt-1 text-sm text-matrix-danger">{error}</p>}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };

