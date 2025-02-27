import React from "react";
import { Briefcase, Calendar, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

// Custom Tab component dengan styling yang lebih baik
const TabsContainer = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="w-full space-y-6">
      <div className="relative">
        {/* Tab navigation */}
        <div className="flex w-full bg-white rounded-lg shadow-sm overflow-hidden">
          {children.map((child, index) => {
            // Extract tab value from TabContent
            const value = child.props.value;
            const isActive = value === activeTab;
            
            // Get icon based on tab value
            let icon;
            let label;
            
            switch (value) {
              case "package-info":
                icon = <Briefcase className="h-5 w-5" />;
                label = "Package Info";
                break;
              case "itinerary":
                icon = <Calendar className="h-5 w-5" />;
                label = "Itinerary";
                break;
              case "prices":
                icon = <DollarSign className="h-5 w-5" />;
                label = "Prices";
                break;
              default:
                icon = null;
                label = value;
            }
            
            return (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`relative flex-1 flex flex-col items-center justify-center py-6 px-2 transition-all duration-200 ${
                  isActive 
                    ? "text-blue-600" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  {icon}
                  <span className="font-medium">{label}</span>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Blue progress line that stretches across tabs */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-100"></div>
      </div>
      
      {/* Tab content */}
      <div>
        {children.find(child => child.props.value === activeTab)}
      </div>
    </div>
  );
};

// Tab content component
const TabContent = ({ value, children }) => {
  return <div>{children}</div>;
};

// Usage example
const TabsExample = () => {
  const [activeTab, setActiveTab] = React.useState("package-info");
  
  return (
    <TabsContainer activeTab={activeTab} setActiveTab={setActiveTab}>
      <TabContent value="package-info">
        <div>Package Info Content</div>
      </TabContent>
      <TabContent value="itinerary">
        <div>Itinerary Content</div>
      </TabContent>
      <TabContent value="prices">
        <div>Prices Content</div>
      </TabContent>
    </TabsContainer>
  );
};

export { TabsContainer, TabContent };