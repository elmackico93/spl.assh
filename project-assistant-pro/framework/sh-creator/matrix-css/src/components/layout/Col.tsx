import React, { HTMLAttributes, forwardRef } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const colVariants = cva(
  'px-[calc(var(--m-gap)/2)] mb-[var(--m-gap)]',
  {
    variants: {
      xs: {
        '1': 'w-[8.333333%]',
        '2': 'w-[16.666667%]',
        '3': 'w-[25%]',
        '4': 'w-[33.333333%]',
        '5': 'w-[41.666667%]',
        '6': 'w-[50%]',
        '7': 'w-[58.333333%]',
        '8': 'w-[66.666667%]',
        '9': 'w-[75%]',
        '10': 'w-[83.333333%]',
        '11': 'w-[91.666667%]',
        '12': 'w-[100%]',
        auto: 'w-auto',
      },
      sm: {
        '1': 'sm:w-[8.333333%]',
        '2': 'sm:w-[16.666667%]',
        '3': 'sm:w-[25%]',
        '4': 'sm:w-[33.333333%]',
        '5': 'sm:w-[41.666667%]',
        '6': 'sm:w-[50%]',
        '7': 'sm:w-[58.333333%]',
        '8': 'sm:w-[66.666667%]',
        '9': 'sm:w-[75%]',
        '10': 'sm:w-[83.333333%]',
        '11': 'sm:w-[91.666667%]',
        '12': 'sm:w-[100%]',
        auto: 'sm:w-auto',
      },
      md: {
        '1': 'md:w-[8.333333%]',
        '2': 'md:w-[16.666667%]',
        '3': 'md:w-[25%]',
        '4': 'md:w-[33.333333%]',
        '5': 'md:w-[41.666667%]',
        '6': 'md:w-[50%]',
        '7': 'md:w-[58.333333%]',
        '8': 'md:w-[66.666667%]',
        '9': 'md:w-[75%]',
        '10': 'md:w-[83.333333%]',
        '11': 'md:w-[91.666667%]',
        '12': 'md:w-[100%]',
        auto: 'md:w-auto',
      },
      lg: {
        '1': 'lg:w-[8.333333%]',
        '2': 'lg:w-[16.666667%]',
        '3': 'lg:w-[25%]',
        '4': 'lg:w-[33.333333%]',
        '5': 'lg:w-[41.666667%]',
        '6': 'lg:w-[50%]',
        '7': 'lg:w-[58.333333%]',
        '8': 'lg:w-[66.666667%]',
        '9': 'lg:w-[75%]',
        '10': 'lg:w-[83.333333%]',
        '11': 'lg:w-[91.666667%]',
        '12': 'lg:w-[100%]',
        auto: 'lg:w-auto',
      },
      xl: {
        '1': 'xl:w-[8.333333%]',
        '2': 'xl:w-[16.666667%]',
        '3': 'xl:w-[25%]',
        '4': 'xl:w-[33.333333%]',
        '5': 'xl:w-[41.666667%]',
        '6': 'xl:w-[50%]',
        '7': 'xl:w-[58.333333%]',
        '8': 'xl:w-[66.666667%]',
        '9': 'xl:w-[75%]',
        '10': 'xl:w-[83.333333%]',
        '11': 'xl:w-[91.666667%]',
        '12': 'xl:w-[100%]',
        auto: 'xl:w-auto',
      },
    },
    defaultVariants: {
      xs: '12',
    },
  }
);

export interface ColProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof colVariants> {}

const Col = forwardRef<HTMLDivElement, ColProps>(
  ({ className, xs, sm, md, lg, xl, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(colVariants({ xs, sm, md, lg, xl }), className)}
        {...props}
      />
    );
  }
);

Col.displayName = 'Col';

export { Col };

