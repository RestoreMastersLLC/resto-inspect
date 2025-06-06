import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  hapticFeedback?: 'light' | 'medium' | 'heavy';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  hapticFeedback = 'medium',
  className,
  disabled,
  ...props
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'btn-touch', // Touch-friendly sizing
    'ripple', // Ripple effect
  ];

  const variantClasses = {
    primary: [
      'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
      'focus:ring-blue-500',
      'shadow-lg hover:shadow-xl transform hover:scale-105',
    ],
    secondary: [
      'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-800',
      'focus:ring-gray-500',
      'border border-gray-600',
    ],
    danger: [
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      'focus:ring-red-500',
      'shadow-lg hover:shadow-xl',
    ],
    ghost: [
      'bg-transparent text-gray-300 hover:bg-gray-800 active:bg-gray-700',
      'focus:ring-gray-500',
    ],
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-base min-h-[44px]', // Mobile-optimized touch target
    lg: 'px-6 py-3 text-lg min-h-[52px]',
  };

  const hapticClasses = {
    light: 'haptic-light',
    medium: 'haptic-medium',
    heavy: 'haptic-heavy',
  };

  const classes = clsx([
    ...baseClasses,
    ...variantClasses[variant],
    sizeClasses[size],
    hapticClasses[hapticFeedback],
    fullWidth && 'w-full',
    className,
  ]);

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button; 