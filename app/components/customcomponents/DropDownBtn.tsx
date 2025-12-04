"use client"
import React, { useState, useRef, useEffect } from 'react'
import { AiOutlineCaretDown } from 'react-icons/ai'

export interface DropDownProps {
  list: string[];
  onSelect?: (selected: string) => void;
  defaultValue?: string;
}

const DropDownBtn = ({ list, onSelect, defaultValue }: DropDownProps) => {
  const [currCat, setCurrCat] = useState(defaultValue || list[0]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const handleSelect = (selected: string) => {
    setCurrCat(selected);
    setIsOpen(false);
    
    // Call the onSelect callback if provided
    if (onSelect) {
      onSelect(selected);
    }
  };

  return (
    <div ref={dropdownRef} className='h-auto w-auto min-w-32 md:min-w-40 lg:min-w-48 flex flex-col relative rounded-sm md:rounded-md shadow-sm'>
        <button 
          className='flex items-center click__action pl-3 md:pl-4 pr-2 md:pr-3 py-1.5 md:py-2 lg:py-2.5 bg-zinc-100 rounded-sm md:rounded-md text-customViolet gap-1 md:gap-2 relative outline-none justify-between group w-full hover:bg-zinc-200 transition-colors' 
          onClick={toggleDropdown}
          type="button"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
            <span className='text-sm md:text-base lg:text-lg truncate'>{currCat}</span>
            <AiOutlineCaretDown 
              className={`text-base md:text-lg transition-transform duration-150 ${
                isOpen ? 'rotate-0 scale-110 text-emerald-700' : '-rotate-90'
              } group-focus:text-emerald-700 group-focus:scale-110`}
            />
        </button>
        
        {isOpen && (
          <div 
            className='flex flex-col rounded-sm md:rounded-md bg-zinc-100 py-1 absolute top-full mt-1 z-50 w-full max-h-60 md:max-h-72 overflow-y-auto shadow-lg'
            role="listbox"
          >
            {list.map((item, index) => (
                <button 
                  key={index} 
                  className={`click__action outline-none py-2 md:py-2.5 text-sm md:text-base w-full px-3 md:px-4 text-left transition-colors duration-150 ${
                    item === currCat 
                      ? 'bg-customViolet text-white' 
                      : 'hover:bg-customViolet/20 focus:bg-customViolet/70 focus:text-white'
                  }`} 
                  onClick={() => handleSelect(item)}
                  type="button"
                  role="option"
                  aria-selected={item === currCat}
                >
                  {item}
                </button>
            ))}
          </div>
        )}
    </div>
  )
}

export default DropDownBtn