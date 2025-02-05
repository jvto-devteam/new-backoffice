import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';

const SearchableSelect = ({
    options,
    value,
    onChange,
    placeholder,
    open,
    setOpen,
    displayKey
}) => {
    const selectRef = useRef(null);
    const searchInputRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    // Filter options berdasarkan search query
    const filteredOptions = options.filter(item => 
        item[displayKey].toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && 
                !selectRef.current.contains(event.target)) {
                if (open) {
                    setOpen(false);
                    setSearchQuery('');
                    setHighlightedIndex(-1); // Reset highlighted index
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, setOpen]);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!open) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setOpen(true);
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
                    setOpen(false);
                    setSearchQuery('');
                    setHighlightedIndex(-1);
                }
                break;

            case 'Escape':
                e.preventDefault();
                setOpen(false);
                setSearchQuery('');
                setHighlightedIndex(-1);
                break;

            default:
                break;
        }
    };

    // Scroll highlighted item into view
    // Autofocus search input when dropdown opens
    useEffect(() => {
        if (open && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [open]);

    useEffect(() => {
        if (highlightedIndex >= 0) {
            const highlightedElement = document.getElementById(`option-${highlightedIndex}`);
            if (highlightedElement) {
                highlightedElement.scrollIntoView({
                    block: 'nearest',
                    inline: 'nearest'
                });
            }
        }
    }, [highlightedIndex]);

    return (
        <div 
            className="relative w-full" 
            ref={selectRef}
            onKeyDown={handleKeyDown}
        >
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-blue-500 focus:ring-2 transition-colors flex justify-between items-center"
            >
                <span className="truncate text-gray-700">
                    {value ? options.find(item => item.id.toString() === value.toString())?.[displayKey] : placeholder}
                </span>
                <ChevronsUpDown className="h-4 w-4 text-gray-400" />
            </button>

            {open && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded shadow-lg border">
                    <div className="sticky top-0 bg-white border-b px-3 py-2">
                        <div className="flex items-center">
                            <Search className="h-4 w-4 text-gray-400 mr-2" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setHighlightedIndex(0); // Reset highlight ke item pertama saat search
                                }}
                                className="w-full bg-transparent border-none focus:outline-none"
                                placeholder="Search..."
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-auto">
                        {filteredOptions.map((item, index) => (
                            <div
                                id={`option-${index}`}
                                key={item.id}
                                onClick={() => {
                                    onChange(item.id);
                                    setOpen(false);
                                    setSearchQuery('');
                                    setHighlightedIndex(-1);
                                }}
                                className={`px-3 py-2 cursor-pointer flex items-center
                                    ${value === item.id ? 'bg-blue-50' : ''}
                                    ${highlightedIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'}
                                `}
                            >
                                <Check 
                                    className={`h-4 w-4 mr-2 text-blue-500 ${value === item.id ? 'opacity-100' : 'opacity-0'}`} 
                                />
                                <span>{item[displayKey]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;