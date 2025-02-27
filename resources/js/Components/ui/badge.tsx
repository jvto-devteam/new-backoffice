import React from "react";

const badgeVariants = {
  default: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  destructive: "bg-red-100 text-red-800 hover:bg-red-200",
  outline: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-100",
  success: "bg-green-100 text-green-800 hover:bg-green-200",
  warning: "bg-amber-100 text-amber-800 hover:bg-amber-200",
};

const Badge = ({
  className = "",
  variant = "default",
  children,
  ...props
}) => {
  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${badgeVariants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Badge, badgeVariants };