"use client";
import { ChangePageProps } from '@/types';
import React, { useState } from 'react'
import { AiOutlineDown, AiOutlineUpload, AiOutlineUser } from 'react-icons/ai'
import { HiOutlineArrowNarrowLeft, HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { TitleButton } from './customcomponents';

const AddTenant = ({ setPage }:ChangePageProps ) => {
  const sexSelect = ["M", "F"];
  const [currSex, setCurrSex] = useState("Sex");
  const [sex, setSex] = useState(false);
  const toggleSex = () => {
    setSex(!sex);
  }
  const changeSex = (s: string) => {
    sexSelect.forEach((sx) => { if (sx === s) { 
      setCurrSex(sx); 
      setSex(false);
    }});
  }
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
    <div className='column__align text-customViolet gap-3 px-5 py-3 select-none bg-white rounded-t-2xl overflow-hidden'>
      <TitleButton setPage={setPage} title="Tenant Information"/>
      <div className='max__size flex flex-col gap-5 overflow-x-hidden'>
        <h2 className='h2__style mr-auto md:mt-5'>Personal Information</h2>
        <div className='flex__center__all h-auto w-full py-2'>
          <button className='focus__action click__action outline-none rounded-full bg-customViolet h-24 w-24 text-white md:h-28 md:w-28'><AiOutlineUser className='max__size mt-2'/></button>
        </div>
        <div className='primary__btn__holder text-sm md:text-base'>
          <input type="text" placeholder='Last Name' className='col-span-6 main__input input__text text__overflow md:col-span-6'/>
          <input type="text" placeholder='First Name' className='col-span-6 main__input input__text text__overflow md:col-span-6'/>
          <input type="text" placeholder='M' className='col-span-2 main__input input__text text__overflow md:col-span-1 md:text-center text-center'/>
          <div className='h-auto w-auto relative col-span-3 md:col-span-2'>
              <button className='main__input flex__center__y pr-3 w-full group justify-between' onClick={toggleSex}>{currSex} <AiOutlineDown className='click__action text-base rounded-xs group-focus:text-emerald-700 group-focus:scale-110'/></button>
              { sex && (
              <div className='column__align rounded-sm items-center gap-0.5 text-sm font-light tracking-wide absolute top-12 bg-zinc-100 overflow-hidden ring-2 ring-white'>
                  { sexSelect.map((s) => (<button className='w-full py-0.5 outline-none focus:bg-customViolet/70 focus:text-white' onClick={() => changeSex(s)}>{s}</button>))}
              </div>
              )}
          </div>
          <input type="number" placeholder='0' min={0} className='col-span-2 main__input input__text text__overflow md:col-span-1 md:text-center text-center'/>
          <input type="date" className='col-span-5 main__input input__text md:col-span-5'/>
          <input type="number" placeholder='Unit #' className='col-span-3 main__input input__text text__overflow'/>
          <input type="email" placeholder='@email.com' className='col-span-9 main__input input__text text__overflow md:col-span-full'/>
          <div className='col-span-6 main__input text__overflow flex gap-3'>
              <span className='font-medium'>+63</span>
              <input type="text" className='input__text text__overflow w-full' placeholder='9xx xxx xxxx'/>
          </div>
          <div className='col-span-6 main__input text__overflow flex gap-3'>
              <span className='font-medium'>+63</span>
              <input type="text" className='input__text text__overflow w-full' placeholder='9xx xxx xxxx'/>
          </div>
        </div>
        <h2 className='h2__style mr-auto'>Credentials</h2>
        <div className='primary__btn__holder md:gap-5'>
          <div className='col-span-6 rounded-sm bg-zinc-100 h-40 flex flex-col relative md:col-span-4 md:h-52 shadow-sm'>
            <button className='flex__center__all click__action h-3/4 w-full text-xs flex-col text-customViolet/70 bg-slate-50 outline-none focus:text-customViolet group md:text-base'>
              <AiOutlineUpload className='click__action text-5xl group-focus:text-6xl md:text-6xl'/>
                        Upload Image
            </button>
            <button className='flex__center__y h-1/4 w-full text-sm justify-between p-3 outline-none group md:text-base' onClick={() => toggleID(0)}>
              {currID[0]} 
              <AiOutlineDown className='group-focus:text-emerald-700 group-focus:scale-110 text-base'/>
            </button>
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
              <button className='flex__center__y h-1/4 w-full text-sm justify-between p-3 outline-none group md:text-base' onClick={() => toggleID(1)}>{currID[1]} 
                <AiOutlineDown className='group-focus:text-emerald-700 group-focus:scale-110'/>
              </button>
              {id[1] && (
                <div className='column__align rounded-sm bg-zinc-100 py-1 absolute top-full mt-1 z-50'>
                  {ids.map((id, i) => (
                    <button key={i} className='click__action outline-none py-1 text-sm w-full focus:bg-customViolet/70 focus:text-white md:text-base' onClick={() => changeID(i, 1)}>{id}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        <div className='column__align gap-2 mt-3'>
          <div className='column__align py-2 text-xs tracking-wide font-light gap-2 md:text-sm'>
            <h6 className='text-sm font-medium md:text-base'>Please Read the Business Rules and Regulations.</h6>
            <p className='bg-slate-50 px-3 py-2'>I permit the use of my personal information for the optimization and utilization of the application (Co-Living). I also understand and will obey the stated rules and regulations below:
              <br /><strong className='strong'>1.)</strong>I will never smoke cigarette in public comfort room, balcony, and hallway.
              <br /><strong className='strong'>2.)</strong>I will pay the rent upon due notice and in any case I delayed the payment, it will be no longer than 1 month.
              <br /><strong className='strong'>3.)</strong>I will adhere stated announcements posted by the landlord in the app.
              <br /><strong className='strong'>4.)</strong>I will not let any visitations within curfew hours.
              <br /><strong className='strong'>5.)</strong>I will not make any loud noises within curfew hours.
              <br /><strong className='strong'>6.)</strong>I will be responsible for the damages in the unit upon my whole stay.
              <br /><strong className='strong'>7.)</strong>I will discuss any concerns to the landlord.
              <br /><strong className='strong'>8.)</strong>I will be up-to-date to the latest announcement made by the landlord.
              <br /><strong className='strong'>9.)</strong>I will not conduct any illegal activities nor operations in the unit.
              <br /><strong className='strong'>10.)</strong>I will observe and maintain good conduct in the building and community.
              <br />Doing any of the stated rules above will cause me to face proper penalties and charges.
            </p>
          </div>
          <div className='flex__center__y gap-2 text-sm md:text-base'>
              <input type="checkbox" name="" id="" className='h-7 w-7 md:h-9 md:w-9'/>
              <span>I agree to the terms and conditions.</span>
          </div>
          <div className='w-full flex justify-end gap-2 mt-5 md:flex md:items-center md:justify-center md:mt-10'>
            <button className='click__action hover__action focus__action flex__center__y border border-zinc-400 rounded-sm gap-3 text-zinc-400 justify-between px-5 md:gap-5'><HiOutlineArrowNarrowLeft className='text-2xl'/> Cancel</button>
            <button className='primary__btn click__action hover__action focus__action flex__center__y justify-between px-5 md:gap-5'>Create Account <HiOutlineArrowNarrowRight className='text-2xl'/></button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddTenant
