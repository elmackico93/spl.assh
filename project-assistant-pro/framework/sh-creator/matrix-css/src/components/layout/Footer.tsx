import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Container } from './Container';

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  bordered?: boolean;
  containerFluid?: boolean;
}

const Footer = forwardRef<HTMLElement, FooterProps>(
  ({ className, children, bordered = true, containerFluid = false, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn(
          'bg-matrix-panel py-6',
          bordered && 'border-t border-matrix-border',
          className
        )}
        {...props}
      >
        <Container fluid={containerFluid}>{children}</Container>
      </footer>
    );
  }
);

Footer.displayName = 'Footer';

export { Footer };

