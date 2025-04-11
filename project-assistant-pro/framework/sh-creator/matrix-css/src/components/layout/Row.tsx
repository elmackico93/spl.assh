import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface RowProps extends HTMLAttributes<HTMLDivElement> {
  noGutters?: boolean;
}

const Row = forwardRef<HTMLDivElement, RowProps>(
  ({ className, noGutters = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-wrap',
          noGutters
            ? 'mx-0'
            : 'mx-[calc(var(--m-gap)/-2)]',
          className
        )}
        {...props}
      />
    );
  }
);

Row.displayName = 'Row';

export { Row };

