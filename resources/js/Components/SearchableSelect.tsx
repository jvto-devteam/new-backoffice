import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { createPortal } from 'react-dom';

// Portal component untuk merender dropdown di luar hierarki DOM
const Portal = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  return mounted ? createPortal(children, document.body) : null;
};

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  open,
  setOpen,
  displayKey = 'name',
  filterKey,
  filterValue,
  className = '',
  disabled = false,
}) => {
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Menggunakan controlled atau uncontrolled open state
  const isOpen = open !== undefined ? open : internalOpen;
  const toggleOpen = setOpen || setInternalOpen;

  // Filter options berdasarkan search query dan optional filterKey/filterValue
  const filteredOptions = options.filter(item => {
    // Filter berdasarkan filterKey/filterValue jika disediakan
    const passesFilter = !filterKey || !filterValue || 
                        (item[filterKey] !== undefined && 
                         String(item[filterKey]) === String(filterValue));
    
    // Filter berdasarkan search query
    const passesSearch = !searchQuery || 
                        (item[displayKey] !== undefined && 
                         String(item[displayKey])
                           .toLowerCase()
                           .includes(searchQuery.toLowerCase()));
    
    return passesFilter && passesSearch;
  });

  // Menghitung posisi dropdown saat terbuka
  useEffect(() => {
    if (isOpen && selectRef.current) {
      const triggerRect = selectRef.current.getBoundingClientRect();
      const { top, left, height, width } = triggerRect;
      
      // Set posisi dropdown
      setDropdownPosition({
        top: top + height + window.scrollY + 5, // 5px gap
        left: left + window.scrollX,
        width: width
      });
    }
  }, [isOpen]);

  // Auto-focus input pencarian saat dropdown terbuka
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);

  // Event listener untuk scroll dan resize
  useEffect(() => {
    const handleScrollResize = () => {
      if (isOpen && selectRef.current) {
        const triggerRect = selectRef.current.getBoundingClientRect();
        const { top, left, height, width } = triggerRect;
        
        setDropdownPosition({
          top: top + height + window.scrollY + 5,
          left: left + window.scrollX,
          width: width
        });
      }
    };
    
    window.addEventListener('scroll', handleScrollResize);
    window.addEventListener('resize', handleScrollResize);
    
    return () => {
      window.removeEventListener('scroll', handleScrollResize);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, [isOpen]);

  // Event listener untuk click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        selectRef.current && 
        !selectRef.current.contains(event.target) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target)
      ) {
        if (isOpen) {
          toggleOpen(false);
          setSearchQuery('');
          setHighlightedIndex(-1);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggleOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        toggleOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : prev
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          onChange(filteredOptions[highlightedIndex].id);
          toggleOpen(false);
          setSearchQuery('');
          setHighlightedIndex(-1);
        }
        break;

      case 'Escape':
        e.preventDefault();
        toggleOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
        break;

      default:
        break;
    }
  };

  // Scroll to highlighted item
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = document.getElementById(`option-${highlightedIndex}`);
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [highlightedIndex]);

  // Find selected item for display
  const selectedItem = options.find(item => 
    item.id !== undefined && String(item.id) === String(value)
  );

  return (
    <div 
      className={`relative w-full ${className}`} 
      ref={selectRef}
      onKeyDown={handleKeyDown}
      data-testid="searchable-select"
    >
      <button
        type="button"
        onClick={() => !disabled && toggleOpen(!isOpen)}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-blue-500 focus:ring-2 transition-colors flex justify-between items-center ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
        }`}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={`truncate ${!selectedItem ? 'text-gray-500' : 'text-gray-700'}`}>
          {selectedItem && selectedItem[displayKey] !== undefined 
            ? selectedItem[displayKey] 
            : placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && !disabled && (
        <Portal>
          <div 
            ref={dropdownRef}
            className="fixed z-[9999] bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              animation: 'dropdown-enter 0.2s ease-out',
            }}
          >
            <div className="sticky top-0 bg-white border-b px-3 py-2">
              <div className="flex items-center">
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0); // Reset highlight to first item when searching
                  }}
                  className="w-full bg-transparent border-none focus:outline-none text-sm p-1"
                  placeholder="Search..."
                  onClick={(e) => e.stopPropagation()}
                  data-testid="search-input"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-auto" role="listbox">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((item, index) => (
                  <div
                    id={`option-${index}`}
                    key={item.id}
                    role="option"
                    aria-selected={value === item.id}
                    onClick={() => {
                      onChange(item.id);
                      toggleOpen(false);
                      setSearchQuery('');
                      setHighlightedIndex(-1);
                    }}
                    className={`px-3 py-2 cursor-pointer flex items-center
                      ${value === item.id ? 'bg-blue-50' : ''}
                      ${highlightedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'}
                    `}
                    data-testid={`option-${item.id}`}
                  >
                    <Check 
                      className={`h-4 w-4 mr-2 text-blue-500 ${value === item.id ? 'opacity-100' : 'opacity-0'}`} 
                    />
                    <span>{item[displayKey] !== undefined ? item[displayKey] : '—'}</span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-center">
                  No options found
                </div>
              )}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default SearchableSelect;