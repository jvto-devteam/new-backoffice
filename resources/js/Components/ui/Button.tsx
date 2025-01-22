import React from 'react';

// Helper function to join classnames
const cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

// Base button styles
const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

// Variant styles
const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
    outline: "border border-gray-300 bg-white hover:bg-gray-100 focus-visible:ring-gray-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500",
    ghost: "hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500",
    link: "text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500"
};

// Size styles
const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md text-xs",
    lg: "h-11 px-8 rounded-md text-base",
    icon: "h-10 w-10"
};

const Button = React.forwardRef(({
    className = "",
    variant = "default",
    size = "default",
    type = "button",
    disabled = false,
    children,
    ...props
}, ref) => {
    return (
        <button
            type={type}
            disabled={disabled}
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                className
            )}
            ref={ref}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = "Button";

export { Button };