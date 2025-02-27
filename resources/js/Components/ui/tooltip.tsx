import React, { useState } from "react";

const TooltipProvider = ({ children }) => {
  return <>{children}</>;
};

const TooltipTrigger = ({ asChild = false, children, ...props }) => {
  // If asChild is true, we clone the child and add props
  const child = asChild ? React.Children.only(children) : null;
  
  if (asChild && child) {
    return React.cloneElement(child, {
      ...props,
      ...child.props,
    });
  }

  return <span {...props}>{children}</span>;
};

const TooltipContent = ({ children, className = "" }) => {
  return (
    <div 
      className={`z-50 overflow-hidden rounded-md bg-gray-800 px-3 py-1.5 text-xs text-white shadow-md ${className}`} 
    >
      {children}
    </div>
  );
};

const Tooltip = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Find the trigger and content children
  let trigger = null;
  let content = null;

  React.Children.forEach(children, (child) => {
    if (child.type === TooltipTrigger) {
      trigger = React.cloneElement(child, {
        onMouseEnter: () => setIsVisible(true),
        onMouseLeave: () => setIsVisible(false),
        onFocus: () => setIsVisible(true),
        onBlur: () => setIsVisible(false),
      });
    } else if (child.type === TooltipContent) {
      content = child;
    }
  });

  return (
    <div className="relative inline-block">
      {trigger}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-1">
          {content}
        </div>
      )}
    </div>
  );
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };