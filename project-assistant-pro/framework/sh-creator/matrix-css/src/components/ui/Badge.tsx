import React, { HTMLAttributes, forwardRef } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-matrix-text focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-matrix-panel border border-matrix-border text-matrix-text',
        primary: 'bg-matrix-primary bg-opacity-20 text-matrix-text-bright',
        secondary: 'bg-matrix-secondary border border-matrix-border text-matrix-text',
        success: 'bg-matrix-success bg-opacity-20 text-matrix-success',
        warning: 'bg-matrix-warning bg-opacity-20 text-matrix-warning',
        danger: 'bg-matrix-danger bg-opacity-20 text-matrix-danger',
        info: 'bg-matrix-info bg-opacity-20 text-matrix-info',
        outline: 'border border-matrix-border text-matrix-text bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };

