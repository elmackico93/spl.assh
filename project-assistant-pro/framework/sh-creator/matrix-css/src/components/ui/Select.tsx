import React, { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, ...props }, ref) => {
    const selectId = id || Math.random().toString(36).substring(2, 9);

    return (
      <div className="mb-4">
        {label && (
          <label
            htmlFor={selectId}
            className="block mb-2 text-sm font-medium text-matrix-text"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          className={cn(
            'block w-full p-2 bg-matrix-bg bg-opacity-90 border text-matrix-text',
            'focus:ring-2 focus:ring-matrix-text focus:outline-none',
            'border-matrix-border rounded transition-all duration-200',
            'appearance-none bg-no-repeat',
            // Styled dropdown arrow using background image
            'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2300ff41\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")]',
            'bg-[position:right_0.75rem_center]',
            'bg-[size:1em]',
            'pr-10',
            error && 'border-matrix-danger',
            className
          )}
          ref={ref}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-matrix-danger">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };

