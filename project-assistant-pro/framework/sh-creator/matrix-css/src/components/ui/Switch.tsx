import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, ...props }, ref) => {
    const switchId = id || Math.random().toString(36).substring(2, 9);

    return (
      <label
        htmlFor={switchId}
        className="relative inline-flex items-center cursor-pointer mb-4"
      >
        <input
          id={switchId}
          type="checkbox"
          className="sr-only peer"
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            "w-11 h-6 bg-matrix-bg border border-matrix-border rounded-full peer",
            "peer-focus:ring-2 peer-focus:ring-matrix-text peer-focus:outline-none",
            "peer-checked:after:translate-x-full peer-checked:after:border-white",
            "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
            "after:bg-matrix-text-dim after:border-matrix-border after:border after:rounded-full",
            "after:h-5 after:w-5 after:transition-all",
            "peer-checked:bg-matrix-primary peer-checked:bg-opacity-20",
            "peer-checked:after:bg-matrix-text",
            className
          )}
        ></div>
        {label && <span className="ml-3 text-sm text-matrix-text">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };

