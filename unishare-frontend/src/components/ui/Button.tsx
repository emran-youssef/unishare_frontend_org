import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'surface' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const variantClasses = {
    primary: 'btn-primary',
    ghost:   'btn-ghost',
    surface: 'btn-surface',
    danger:  'bg-error-container/50 text-error hover:bg-error-container transition-colors rounded-lg font-label font-medium active:scale-95',
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-label font-semibold transition-all duration-200
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon && <span className="material-symbols-outlined text-[18px]">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && (
        <span className="material-symbols-outlined text-[18px]">{rightIcon}</span>
      )}
    </button>
  );
}
