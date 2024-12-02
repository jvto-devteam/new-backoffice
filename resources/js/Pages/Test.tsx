import Main from '@/Layouts/Main';
import React, { useState } from 'react';
import { 
  Calendar,
  Users,
  Truck,
  ArrowRight,
  Plus,
  Check,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const Test = () => {
  const [activeButton, setActiveButton] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});

  const simulateLoading = (id) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
      setActiveButton(id);
    }, 1000);
  };

  return (
    <Main>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="space-y-12">
            {/* Primary Actions */}
            <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Interactive Buttons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InteractiveButton
                id="create"
                label="Create Booking"
                icon={Calendar}
                gradient="from-blue-500 to-indigo-500"
                isActive={activeButton === 'create'}
                isLoading={loadingStates['create']}
                onClick={() => simulateLoading('create')}
                />
                
                <InteractiveButton
                id="assign"
                label="Assign Resources"
                icon={Users}
                gradient="from-purple-500 to-pink-500"
                isActive={activeButton === 'assign'}
                isLoading={loadingStates['assign']}
                onClick={() => simulateLoading('assign')}
                />
            </div>
            </section>

            {/* Cards with States */}
            <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Interactive Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InteractiveCard
                title="Tour Management"
                description="Schedule and manage tours"
                icon={Calendar}
                gradient="from-cyan-500 to-blue-500"
                />
                
                <InteractiveCard
                title="Resource Planning"
                description="Organize guides and vehicles"
                icon={Users}
                gradient="from-purple-500 to-pink-500"
                />
                
                <InteractiveCard
                title="Fleet Management"
                description="Monitor vehicle status"
                icon={Truck}
                gradient="from-emerald-500 to-teal-500"
                />
            </div>
            </section>

            {/* Action Buttons with States */}
            <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">State Buttons</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <StateButton
                label="Default"
                icon={Plus}
                state="default"
                />
                
                <StateButton
                label="Success"
                icon={Check}
                state="success"
                />
                
                <StateButton
                label="Warning"
                icon={AlertTriangle}
                state="warning"
                />
                
                <StateButton
                label="Loading"
                icon={Loader2}
                state="loading"
                />
            </div>
            </section>
        </div>
        </div>
    </Main>
  );
};

const InteractiveButton = ({ 
  id, 
  label, 
  icon: Icon, 
  gradient, 
  isActive, 
  isLoading, 
  onClick 
}) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className={`
      relative group
      w-full px-6 py-4 rounded-xl
      bg-gradient-to-r ${gradient}
      transition-all duration-300 ease-in-out
      transform-gpu
      
      /* Hover Effects */
      hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-white/10
      hover:translate-y-[-2px]
      hover:opacity-90
      
      /* Focus Effects */
      focus:outline-none focus:ring-2 focus:ring-gray-200/50 dark:focus:ring-white/20
      focus:scale-[0.98]
      
      /* Active Effects */
      active:scale-[0.97]
      
      /* Disabled State */
      disabled:opacity-75 disabled:cursor-not-allowed
      disabled:hover:translate-y-0
    `}
  >
    <div className="relative flex items-center justify-center space-x-3">
      {isLoading ? (
        <Loader2 className="w-5 h-5 text-white animate-spin" />
      ) : (
        <>
          <Icon className="w-5 h-5 text-white 
            transition-transform duration-300 ease-in-out
            group-hover:scale-110" 
          />
          <span className="font-medium text-white">{label}</span>
          {isActive && (
            <div className="absolute -right-2 -top-2 w-3 h-3 bg-green-400 rounded-full
              shadow-lg shadow-green-500/50 animate-pulse" 
            />
          )}
        </>
      )}
    </div>
  </button>
);

const InteractiveCard = ({ title, description, icon: Icon, gradient }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative p-6 rounded-xl
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        transition-all duration-300 ease-in-out
        transform-gpu
        
        /* Hover Effects */
        hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-white/10
        hover:border-gray-300 dark:hover:border-gray-600
        hover:translate-y-[-4px]
        
        /* Interactive States */
        cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-gray-200/50 dark:focus:ring-white/20
      `}
    >
      {/* Animated Icon Container */}
      <div className={`
        w-12 h-12 rounded-xl
        bg-gradient-to-r ${gradient}
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        transform-gpu
        ${isHovered ? 'scale-110' : ''}
      `}>
        <Icon className="w-6 h-6 text-white
          transition-transform duration-300 ease-in-out
          transform-gpu" 
        />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>

      {/* Interactive Footer */}
      <div className={`
        mt-4 flex items-center text-gray-500 dark:text-gray-400
        transition-all duration-300 ease-in-out
        ${isHovered ? 'text-gray-900 dark:text-white translate-x-2' : ''}
      `}>
        <span>Learn more</span>
        <ArrowRight className={`
          w-4 h-4 ml-2
          transition-all duration-300 ease-in-out
          transform-gpu
          ${isHovered ? 'translate-x-1' : ''}
        `} />
      </div>
    </div>
  );
};

const StateButton = ({ label, icon: Icon, state }) => {
  const stateStyles = {
    default: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700",
    success: "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/30",
    warning: "bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/30",
    loading: "bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
  };

  return (
    <button
      disabled={state === 'loading'}
      className={`
        relative w-full px-4 py-3 rounded-xl
        transition-all duration-300 ease-in-out
        transform-gpu
        ${stateStyles[state]}
        
        /* Common Interactive States */
        hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-white/10
        focus:outline-none focus:ring-2 focus:ring-gray-200/50 dark:focus:ring-white/20
        active:scale-[0.97]
        disabled:opacity-75 disabled:cursor-not-allowed
      `}
    >
      <div className="flex items-center justify-center space-x-2">
        {state === 'loading' ? (
          <Icon className="w-5 h-5 animate-spin" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
        <span>{label}</span>
      </div>
      
      {/* Success Indicator */}
      {state === 'success' && (
        <span className="absolute -right-1 -top-1 w-3 h-3 bg-emerald-400 rounded-full
          animate-pulse" 
        />
      )}
      
      {/* Warning Indicator */}
      {state === 'warning' && (
        <span className="absolute -right-1 -top-1 w-3 h-3 bg-amber-400 rounded-full
          animate-ping" 
        />
      )}
    </button>
  );
};

export default Test;