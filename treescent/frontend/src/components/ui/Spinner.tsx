import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', color = 'primary', className = '', ...props }, ref) => {
    const sizeStyles = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-4',
      lg: 'w-12 h-12 border-4',
    };

    const colorStyles = {
      primary: 'border-indigo-600 border-t-transparent',
      white: 'border-white border-t-transparent',
      gray: 'border-gray-300 border-t-transparent dark:border-gray-600',
    };

    return (
      <div
        ref={ref}
        className={`${sizeStyles[size]} ${colorStyles[color]} rounded-full animate-spin ${className}`}
        role="status"
        aria-label="Loading"
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <Spinner size="lg" />
  </div>
);