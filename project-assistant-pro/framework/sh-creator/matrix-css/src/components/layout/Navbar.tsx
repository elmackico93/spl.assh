import React, { useState, forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Container } from './Container';

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  fixed?: boolean;
  transparent?: boolean;
  bordered?: boolean;
  containerFluid?: boolean;
}

const Navbar = forwardRef<HTMLElement, NavbarProps>(
  ({ className, children, fixed = false, transparent = false, bordered = true, containerFluid = false, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <nav
        ref={ref}
        className={cn(
          'bg-matrix-panel z-10',
          fixed && 'fixed top-0 left-0 right-0',
          bordered && 'border-b border-matrix-border',
          transparent && 'bg-transparent backdrop-blur-sm',
          className
        )}
        {...props}
      >
        <Container fluid={containerFluid}>
          <div className="flex flex-wrap items-center justify-between py-4">
            {children}
          </div>
        </Container>
      </nav>
    );
  }
);

Navbar.displayName = 'Navbar';

interface NavbarBrandProps extends HTMLAttributes<HTMLDivElement> {}

const NavbarBrand = forwardRef<HTMLDivElement, NavbarBrandProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center text-matrix-text-bright font-matrix-hacker text-lg font-bold',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NavbarBrand.displayName = 'NavbarBrand';

interface NavbarTogglerProps extends HTMLAttributes<HTMLButtonElement> {
  isOpen: boolean;
  onClick: () => void;
}

const NavbarToggler = forwardRef<HTMLButtonElement, NavbarTogglerProps>(
  ({ className, isOpen, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'block md:hidden p-2 text-matrix-text hover:text-matrix-text-bright focus:outline-none',
          className
        )}
        onClick={onClick}
        aria-expanded={isOpen}
        aria-label="Toggle navigation"
        {...props}
      >
        <div className="w-6 flex items-center justify-center relative h-5">
          <span
            className={cn(
              'absolute h-0.5 w-full bg-current transform transition duration-300 ease-in-out',
              isOpen ? 'rotate-45' : '-translate-y-1.5'
            )}
          />
          <span
            className={cn(
              'absolute h-0.5 bg-current transform transition-all duration-200 ease-in-out',
              isOpen ? 'w-0 opacity-0' : 'w-full opacity-100'
            )}
          />
          <span
            className={cn(
              'absolute h-0.5 w-full bg-current transform transition duration-300 ease-in-out',
              isOpen ? '-rotate-45' : 'translate-y-1.5'
            )}
          />
        </div>
      </button>
    );
  }
);

NavbarToggler.displayName = 'NavbarToggler';

interface NavbarCollapseProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
}

const NavbarCollapse = forwardRef<HTMLDivElement, NavbarCollapseProps>(
  ({ className, isOpen, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full md:flex md:w-auto md:order-1',
          isOpen ? 'block' : 'hidden',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NavbarCollapse.displayName = 'NavbarCollapse';

interface NavbarNavProps extends HTMLAttributes<HTMLUListElement> {}

const NavbarNav = forwardRef<HTMLUListElement, NavbarNavProps>(
  ({ className, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn(
          'flex flex-col mt-4 md:flex-row md:space-x-6 md:mt-0 md:text-sm md:font-medium',
          className
        )}
        {...props}
      />
    );
  }
);

NavbarNav.displayName = 'NavbarNav';

interface NavItemProps extends HTMLAttributes<HTMLLIElement> {
  active?: boolean;
}

const NavItem = forwardRef<HTMLLIElement, NavItemProps>(
  ({ className, active, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn(
          'py-2 md:py-0',
          active && 'text-matrix-text-bright',
          className
        )}
        {...props}
      />
    );
  }
);

NavItem.displayName = 'NavItem';

interface NavLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, active, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          'block py-2 md:py-1 text-matrix-text hover:text-matrix-text-bright transition-colors duration-200',
          active && 'text-matrix-text-bright',
          className
        )}
        {...props}
      />
    );
  }
);

NavLink.displayName = 'NavLink';

export { Navbar, NavbarBrand, NavbarToggler, NavbarCollapse, NavbarNav, NavItem, NavLink };

