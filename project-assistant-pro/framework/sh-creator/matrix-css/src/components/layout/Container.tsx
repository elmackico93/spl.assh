import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  fluid?: boolean;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, fluid = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto px-4',
          fluid ? 'w-full' : 'max-w-[var(--m-container-width)]',
          className
        )}
        {...props}
      />
    );
  }
);

Container.displayName = 'Container';

export { Container };

