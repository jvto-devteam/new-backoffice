import React, { useState, useRef, useEffect } from 'react';
import { Search, Sun, Coffee, Bus, Hotel } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { createPortal } from 'react-dom';

// Portal component untuk merender dropdown di luar hierarki DOM normal
const Portal = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  return mounted ? createPortal(children, document.body) : null;
};

// Dropdown component yang diperbaiki
const ActivityTypeDropdown = ({ isOpen, onSelect, onClose, dayIndex, triggerRef, position = 'bottom',activityTypes }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  
  // Filter aktivitas berdasarkan pencarian
  const filteredTypes = activityTypes.filter(type => 
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Kalkulasi posisi dropdown berdasarkan posisi tombol trigger
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const { top, left, height, width } = triggerRect;
      
      // Default dropdown width
      const dropdownWidth = 256; // w-64 = 16rem = 256px
      
      let newTop, newLeft;
      
      if (position === 'bottom') {
        newTop = top + height + window.scrollY + 5; // 5px gap
        // Center align dropdown with trigger, ensuring it doesn't go off-screen
        newLeft = left + (width / 2) - (dropdownWidth / 2) + window.scrollX;
      } else {
        // Posisi top (di atas tombol)
        newTop = top - 5 - (dropdownRef.current ? dropdownRef.current.offsetHeight : 200) + window.scrollY;
        newLeft = left + (width / 2) - (dropdownWidth / 2) + window.scrollX;
      }
      
      // Pastikan dropdown tidak keluar dari layar ke kiri
      newLeft = Math.max(10, newLeft);
      // Pastikan dropdown tidak keluar dari layar ke kanan
      const maxRight = window.innerWidth - dropdownWidth - 10;
      newLeft = Math.min(maxRight, newLeft);
      
      setDropdownPosition({ top: newTop, left: newLeft });
    }
  }, [isOpen, triggerRef, position]);
  
  // Auto-focus pada search input ketika dropdown terbuka
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen, dropdownPosition]);
  
  // Handle click outside untuk menutup dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) && 
        triggerRef.current && 
        !triggerRef.current.contains(event.target)
      ) {
        onClose();
      }
    };
    
    const handleScroll = () => {
      if (triggerRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const { top, left, height, width } = triggerRect;
        
        const dropdownWidth = 256;
        
        let newTop, newLeft;
        
        if (position === 'bottom') {
          newTop = top + height + window.scrollY + 5;
          newLeft = left + (width / 2) - (dropdownWidth / 2) + window.scrollX;
        } else {
          newTop = top - 5 - (dropdownRef.current ? dropdownRef.current.offsetHeight : 200) + window.scrollY;
          newLeft = left + (width / 2) - (dropdownWidth / 2) + window.scrollX;
        }
        
        newLeft = Math.max(10, newLeft);
        const maxRight = window.innerWidth - dropdownWidth - 10;
        newLeft = Math.min(maxRight, newLeft);
        
        setDropdownPosition({ top: newTop, left: newLeft });
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen, onClose, triggerRef, position]);
  
  if (!isOpen) return null;
  
  return (
    <Portal>
      <div 
        ref={dropdownRef}
        className="fixed z-[9999] w-64 bg-white rounded-md shadow-lg border border-gray-200"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          animation: 'dropdown-enter 0.2s ease-out',
        }}
      >
        <div className="p-3 border-b border-gray-100 bg-gray-50">
          <div className="text-sm font-medium text-gray-700 mb-2">Select activity type</div>
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-8 text-sm"
            />
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>
        
        <div className="max-h-60 overflow-y-auto py-1">
          {filteredTypes.length > 0 ? (
            filteredTypes.map((type) => (
              <div
                key={type.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-600 text-sm flex items-center"
                onClick={() => onSelect(dayIndex, type.id)}
              >
                <span className="mr-2">{type.icon}</span>
                {type.name}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm text-center">
              No activity types found
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
};

export default ActivityTypeDropdown;