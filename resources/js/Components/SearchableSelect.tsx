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

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Pastikan selectRef current ada 
            if (selectRef.current && 
                !selectRef.current.contains(event.target)) {
                
                // Pastikan open state aktif sebelum menutup
                if (open) {
                    setOpen(false);
                    setSearchQuery(''); // Reset search query
                }
            }
        };

        // Tambahkan event listener di document level
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, setOpen]); // Tambahkan open sebagai dependency

    return (
        <div className="relative w-full" ref={selectRef}>
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
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-none focus:outline-none"
                                placeholder="Search..."
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-auto">
                        {options
                            .filter(item => 
                                item[displayKey].toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        onChange(item.id);
                                        setOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className={`px-3 py-2 cursor-pointer flex items-center hover:bg-gray-50 ${
                                        value === item.id ? 'bg-blue-50' : ''
                                    }`}
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