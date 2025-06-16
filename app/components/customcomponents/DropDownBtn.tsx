"use client"
import { DropDownProps } from '@/types';
import React, { useState } from 'react'
import { AiOutlineCaretDown } from 'react-icons/ai'

const DropDownBtn = ({ list }: DropDownProps) => {
  const [currCat, setCurrCat] = useState(list[0]);
  const [category, setCategory] = useState(false);
  const toggleCategory = () => {
    setCategory(!category);
  }
  const changeCat = (cat: number) => {
    list.forEach((btn, i) => {
      if (i === cat) {
        setCurrCat(btn);
        setCategory(false);
      }
    })
  }
  return (
    <div className='h-auto w-auto min-w-32 flex flex-col relative rounded-sm shadow-sm md:w-40'>
        <button className='flex__center__y click__action pl-3 pr-2 py-1.5 bg-zinc-100 rounded-sm text-customViolet gap-1 relative outline-none justify-between group md:py-2' onClick={toggleCategory}>
            <span className='text-sm md:text-base'>{currCat}</span>
            <AiOutlineCaretDown className={`text-base rounded-xs ${category ? 'rotate-0 scale-110 text-emerald-700' : 'rotate-90'} group-focus:text-emerald-700 group-focus:scale-110 ease-in-out duration-150`}/>
        </button>
        {category && (<div className='column__align rounded-sm bg-zinc-100 py-1 absolute top-full mt-1 z-50'>
            { list.map((btn, i) => (
                <button key={i} className='click__action outline-none py-1 text-sm w-full focus:bg-customViolet/70 focus:text-white text-nowrap md:text-base' onClick={()=>changeCat(i)}>{btn}</button>
                ))
            }
        </div>)}
    </div>
  )
}

export default DropDownBtn
