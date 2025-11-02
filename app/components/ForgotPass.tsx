import { ChangePageProps } from '@/types';
import React from 'react'
import { HiOutlineArrowNarrowLeft, HiOutlineArrowNarrowRight } from 'react-icons/hi';

const ForgotPass = ({ setPage }: ChangePageProps) => {
  const inputStyle = "focus__action click__action hover__action h-[4.5rem] w-14 rounded-md text-2xl text-white bg-transparent border border-white font-bold text-center outline-none";
  return (
    <div className='max__size px-5 flex flex-col text-white'>
        <h1 className='font-poppins text-3xl text-white font-light w-full text-center mt-20'>Recover Account</h1>
        <div className='max__size flex__center__all flex-col'>
            <div className='h-44 w-full flex__center__x gap-3 items-start'>
                <input type="number" className={inputStyle}/>
                <input type="number" className={inputStyle}/>
                <input type="number" className={inputStyle}/>
                <input type="number" className={inputStyle}/>
                <input type="number" className={inputStyle}/>
            </div>
            <div className='flex gap-3'>
                <button 
                    className='border border-white px-3 py-2 rounded-md click__action hover__action focus__action flex__center__all'
                    onClick={() => setPage(99)}
                ><HiOutlineArrowNarrowLeft className='text-3xl'/> BACK</button>
                <button className='bg-white rounded-md px-3 py-2 text-customViolet click__action hover__action focus__action flex__center__all'>NEXT <HiOutlineArrowNarrowRight className='text-3xl'/></button>
            </div>
        </div>
  </div>
  )
}

export default ForgotPass
