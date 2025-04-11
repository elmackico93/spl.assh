import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    const radioId = id || Math.random().toString(36).substring(2, 9);

    return (
      <div className="flex items-center mb-4">
        <input
          id={radioId}
          type="radio"
          className={cn(
            'w-4 h-4 bg-matrix-bg border-matrix-border focus:ring-2 focus:ring-matrix-text',
            'text-matrix-text-bright cursor-pointer appearance-none rounded-full',
            'relative before:absolute before:inset-0 before:rounded-full before:bg-matrix-primary before:scale-0 checked:before:scale-100 before:transition-transform',
            'after:absolute after:top-[3px] after:left-[3px] after:w-[6px] after:h-[6px] after:rounded-full after:bg-matrix-bg after:opacity-0 checked:after:opacity-100',
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label htmlFor={radioId} className="ml-2 text-sm text-matrix-text cursor-pointer">
            {label}
          </label>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export { Radio };

