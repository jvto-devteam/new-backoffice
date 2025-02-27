import React from "react";

const Textarea = React.forwardRef(({ 
  className = "", 
  placeholder, 
  onChange, 
  value, 
  disabled = false,
  id,
  rows = 3,
  ...props 
}, ref) => {
  return (
    <textarea
      ref={ref}
      id={id}
      className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      disabled={disabled}
      rows={rows}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };