import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substring(2, 9);

    return (
      <div className="mb-4">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 text-sm font-medium text-matrix-text"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(
            'block w-full p-2 bg-matrix-bg bg-opacity-90 border text-matrix-text',
            'focus:ring-2 focus:ring-matrix-text focus:outline-none',
            'border-matrix-border rounded transition-all duration-200',
            'placeholder:text-matrix-text-dim',
            error && 'border-matrix-danger',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-matrix-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

