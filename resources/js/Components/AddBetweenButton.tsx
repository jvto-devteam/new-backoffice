import React, { useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Button component for adding activities between existing ones in the timeline
 */
const AddBetweenButton = ({ 
  onClick, 
  position, 
  registerRef, 
  className = "" 
}) => {
  const buttonRef = useRef(null);
  
  // Register ref with parent for dropdown positioning
  useEffect(() => {
    if (buttonRef.current && registerRef) {
      registerRef(position, buttonRef.current);
    }
    
    return () => {
      if (registerRef) {
        registerRef(position, null);
      }
    };
  }, [position, registerRef]);
  
  return (
    <div className={`relative pl-8 z-10 ${className}`}>
      {/* Continue vertical line */}
      <div className="absolute top-0 left-3 w-0.5 h-full bg-gray-200"></div>
      
      <div className="">
        <Button 
          ref={buttonRef}
          variant="ghost" 
          size="sm" 
          className="rounded-[100%] p-0 h-[30px] w-[30px] bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-400"
          onClick={onClick}
          title="Add activity here"
        >
            <div>
              <Plus className="h-8 w-8 text-blue-600" />
            </div>
        </Button>
      </div>
    </div>
  );
};

export default AddBetweenButton;