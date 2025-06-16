"use client";
import { ChangePageProps } from '@/types';
import React, { useState } from 'react'
import { AiOutlineDelete, AiOutlineDown, AiOutlineEdit, AiOutlineMan, AiOutlineUpload, AiOutlineUser } from 'react-icons/ai'
import { TbCurrencyPeso } from 'react-icons/tb'
import { TitleButton } from './customcomponents';

const TenantInfo = ({ setPage }:ChangePageProps ) => {
  const ids = ["Driver's License", "UMID Card", "Voter's ID", "PhilSys ID"];
  const [currID, setCurrID] = useState(["Select ID","Select ID"]);
  const [id, setID] = useState([false, false]);
  const toggleID = (btnId: number) => {
    setID(prevState => prevState.map((it, i) => (i === btnId && !it)));
  }
  const changeID = (num: number, id: number) => {
    ids.forEach((value, index) => {
      if (index === num) {
        setCurrID(prevState => prevState.map((idx, i) => (i === id ? value : idx)));
        setID(prevState => prevState.map((it, i) => (i === id ? false : it)));
      }
    })
  }

  return (
    <div className='max__size flex flex-col px-5 gap-3 text-customViolet py-3 overflow-hidden bg-white rounded-t-2xl'>
        <TitleButton setPage={setPage} title="Tenant Information"/>
        <div className='h-full w-full flex flex-col gap-5 overflow-x-hidden'>
          <h2 className='h2__style mr-auto md:mt-5'>Personal Information</h2>
          <div className='h-auto w-full flex__center__all py-2'>
              <button className='focus__action hover__action click__action outline-none rounded-full bg-customViolet h-24 w-24 text-white md:h-28 md:w-28'><AiOutlineUser className='max__size mt-2'/></button>
          </div>
          <div className='primary__btn__holder text-sm md:text-base'>
              <input type="text" placeholder='Dela Cruz' className='col-span-6 text__overflow input__text main__input'/>
              <input type="text" placeholder='Juan' className='col-span-6 text__overflow input__text main__input'/>
              <input type="text" placeholder='M' className='col-span-2 text__overflow input__text main__input text-center md:col-span-1'/>
              <div className='col-span-2 text__overflow input__text main__input flex__center__all md:col-span-1'>
                  <AiOutlineMan />
              </div>
              <input type="number" placeholder='30' min={0} className='col-span-2 text__overflow input__text main__input text-center md:col-span-1'/>
              <input type="date" className='col-span-6 text__overflow input__text main__input md:col-span-6'/>
              <div className='col-span-4 text__overflow input__text main__input md:col-span-3'>
                  <p>Unit No: 101</p>
              </div>
              <input type="email" placeholder='@email.com' className='col-span-8 text__overflow input__text main__input md:col-span-7'/>
              <div className='col-span-6 text__overflow input__text main__input flex gap-3 md:col-span-5'>
                  <span className='font-medium'>+63</span>
                  <input type="text" className='text__overflow input__text w-full' placeholder='9xx xxx xxxx'/>
              </div>
              <div className='col-span-6 bg-zinc-100 py-3 px-5 tracking-wide flex gap-3 md:col-span-5'>
                  <span className='font-medium'>+63</span>
                  <input type="text" className='outline-none placeholder:text-customViolet/70 w-full' placeholder='9xx xxx xxxx'/>
              </div>
              <div className='col-span-8 text__overflow main__input  md:col-span-4'>
                  <p>Renting Since: Aug 2020</p>
              </div>
              <div className='col-span-4 text__overflow main__input  md:col-span-3'>
                  <p className='flex__center__y'>Rent: <TbCurrencyPeso className='text-xs ml-1 text-emerald-700'/><span className='text-emerald-700'>2,500</span></p>
              </div>
          </div>
          <h2 className='h2__style mr-auto mt-5'>Credentials</h2>
          <div className='primary__btn__holder md:gap-5'>
            <div className='col-span-6 rounded-sm bg-zinc-100 h-40 flex flex-col relative md:col-span-4 md:h-52 shadow-sm'>
              <button className='flex__center__all click__action h-3/4 w-full text-xs flex-col text-customViolet/70 bg-slate-50 outline-none focus:text-customViolet group md:text-base'>
                <AiOutlineUpload className='click__action text-5xl group-focus:text-6xl md:text-6xl'/>
                Upload Image
              </button>
              <button className='flex__center__y h-1/4 w-full text-sm justify-between p-3 outline-none group md:text-base' onClick={() => toggleID(0)}>
                {currID[0]} 
                <AiOutlineDown className='group-focus:text-emerald-700 group-focus:scale-110 text-base'/></button>
                {id[0] && (
                  <div className='column__align rounded-sm bg-zinc-100 py-1 absolute top-full mt-1 z-50'>
                    {ids.map((id, i) => (
                    <button key={i} className='click__action outline-none py-1 text-sm w-full focus:bg-customViolet/70 focus:text-white md:text-base' onClick={() => changeID(i, 0)}>{id}</button>
                    ))}
                      </div>
                    )}
            </div>
            <div className='col-span-6 rounded-sm bg-zinc-100 h-40 flex flex-col relative md:col-span-4 md:h-52 shadow-sm'>
                    <button className='flex__center__all click__action h-3/4 w-full text-xs flex-col text-customViolet/70 bg-slate-50 outline-none focus:text-customViolet group md:text-base'>
                      <AiOutlineUpload className='click__action text-5xl group-focus:text-6xl md:text-6xl'/>
                      Upload Image
                    </button>
                    <button className='flex__center__y h-1/4 w-full text-sm justify-between p-3 outline-none group md:text-base' onClick={() => toggleID(1)}>{currID[1]} <AiOutlineDown className='group-focus:text-emerald-700 group-focus:scale-110'/></button>
                    {id[1] && (
                      <div className='column__align rounded-sm bg-zinc-100 py-1 absolute top-full mt-1 z-50'>
                      {ids.map((id, i) => (
                          <button key={i} className='click__action outline-none py-1 text-sm w-full focus:bg-customViolet/70 focus:text-white md:text-base' onClick={() => changeID(i, 1)}>{id}</button>
                        ))}
                      </div>
                    )}
            </div>
          </div>
          <div className='primary__btn__holder mt-5 md:flex md:items-center md:justify-center md:mt-10'>
            <button className='col-span-6 primary__btn click__action hover__action focus__action flex__center__all md:min-w-[200px] md:gap-5'><AiOutlineEdit className='text-2xl'/> Edit</button>
            <button className='col-span-6 primary__btn click__action hover__action focus__action flex__center__all md:min-w-[200px] md:gap-5 group'>Delete <AiOutlineDelete className='text-2xl group-focus:text-rose-700'/></button>
          </div>
        </div>
    </div>
  )
}

export default TenantInfo
