import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded relative border font-matrix transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-matrix-text focus:ring-opacity-50 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default:
          'bg-matrix-panel border-matrix-border text-matrix-text hover:bg-matrix-secondary hover:text-matrix-text-bright before:absolute before:inset-0 before:border-t-2 before:border-t-matrix-text before:opacity-0 hover:before:opacity-100 before:transition-opacity',
        primary:
          'bg-matrix-primary bg-opacity-20 border-matrix-primary text-matrix-text-bright hover:bg-opacity-30 hover:border-matrix-text-bright',
        outline:
          'bg-transparent border-matrix-text text-matrix-text hover:bg-matrix-text hover:bg-opacity-10',
        ghost:
          'bg-transparent border-transparent text-matrix-text hover:bg-matrix-text hover:bg-opacity-10',
        terminal:
          'bg-black bg-opacity-60 border-matrix-text text-matrix-text font-matrix-hacker hover:text-matrix-text-bright hover:border-matrix-text-bright hover:shadow-[0_0_10px_var(--m-glow)]',
        danger:
          'bg-matrix-danger bg-opacity-20 border-matrix-danger text-matrix-danger hover:bg-opacity-30',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
      hasGlow: {
        true: 'shadow-[0_0_10px_var(--m-glow)] hover:shadow-[0_0_15px_var(--m-glow)]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      hasGlow: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, hasGlow, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, hasGlow, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };

