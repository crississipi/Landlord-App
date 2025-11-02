"use client"

import React from 'react'
import { RiEdit2Line, RiStarFill } from 'react-icons/ri';
import { TbCurrencyPeso } from 'react-icons/tb'
import DropDownBtn from './customcomponents/DropDownBtn';
import { ChangePageProps } from '@/types';
import { HiArrowSmallLeft, HiOutlinePlusSmall } from 'react-icons/hi2';

const ManageProperty = ({ setPage }: ChangePageProps) => {
  
  return (
    <div className='max__size px-5 py-3 gap-5 text-customViolet flex flex-col items-start overflow-hidden bg-white rounded-t-2xl'>
      <div className='w-full flex items-center justify-between mt-10 gap-3 text-customViolet'>
        <button type="button" className='text-4xl' onClick={() => setPage(99)}>
          <HiArrowSmallLeft />
        </button>
        <h1 className='font-poppins text-xl font-light w-full text-left'>Manage Properties</h1>
        <button type="button" className='px-3 pl-2 py-2 rounded-md text-sm border border-customViolet/50 flex items-center gap-1 hover:bg-customViolet/50 focus:bg-customViolet focus:text-white ease-out duration-200' onClick={() => setPage(15)}><HiOutlinePlusSmall className='text-xl'/>New</button>
      </div>
      <div className='w-full h-full flex gap-3 overflow-y-hidden flex-nowrap'>
        {Array.from({length: 5}).map((_,i) => (
            <div key={i} className='h-auto min-w-[90vw] flex flex-col relative overflow-x-hidden group'>
                <div className='w-full aspect-square bg-customViolet/70'></div>
                <div className='hidden group-hover:flex group-focus:flex absolute aspect-square w-full bg-black/20 z-50 items-center justify-center'>
                    <button
                      type="button"
                      className="h-24 w-24 rounded-md p-1 text-white/50 border-4 border-white/50 hover:border-white/70 hover:text-white/70 focus:border-white focus:text-white ease-out duration-200"
                      onClick={() => setPage(15)}
                    >
                      <RiEdit2Line className="h-full w-full" />
                    </button>
                  </div>
                <div className='h-max w-full flex items-center justify-between mt-3'>
                    <span className='flex flex-col justify-center leading-2'>
                        <h3 className='text-xl font-semibold'>Unit 10{i}</h3>
                        <p className='text-sm'>Pasay City</p>
                        <h4 className='flex mt-1 gap-1'>
                            <strong className='font-semibold'>125</strong> sqm.
                        </h4>
                    </span>
                    <span className='flex flex-col'>
                        <h4 className='flex items-center text-sm'>
                            <TbCurrencyPeso className='text-xl'/><strong className='text-xl font-semibold'>3,000</strong>/month
                        </h4>
                        <p className='ml-auto'><em>Occupied</em></p>
                    </span>
                </div>
                <div className='w-full flex flex-col'>
                  <span className='w-full flex items-center justify-between mt-5'>
                    <h4 className='text-lg'>Feedbacks</h4>
                    <DropDownBtn list={['Latest', 'Oldest', 'All']} />
                  </span>
                  <div className='w-full flex flex-col gap-2'>
                    {Array.from({length: 5}).map((_,i) => (
                      <div key={i} className='w-full flex flex-col bg-white border-b border-customViolet/50 py-3'>
                        <div className='w-full flex items-center justify-between'>
                          <span className='flex gap-1 items-center text-amber-400'>
                            <RiStarFill />
                            <RiStarFill />
                            <RiStarFill />
                            <RiStarFill />
                            <RiStarFill />
                            <span className='font-medium'>5.0/<span className='text-sm font-light'>5</span></span>
                          </span>
                          <h5>05/25/25</h5>
                        </div>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        <div className='flex items-center gap-2'>
                          <span className='h-9 w-9 rounded-full bg-customViolet'></span>
                          <h3>Anonymous</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  )
}

export default ManageProperty
