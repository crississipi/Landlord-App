import React from 'react'
import { HiOutlineArrowNarrowLeft, HiOutlineArrowNarrowRight } from 'react-icons/hi';

const ForgotPass = () => {
  const inputStyle = "focus__action click__action hover__action h-[4.5rem] w-14 rounded-md bg-zinc-100 text-2xl text-customViolet font-bold text-center outline-none";
  return (
    <div className='max__size px-5 flex flex-col text-customViolet'>
        <h1 className='h1__style'>Recover Account</h1>
        <div className='max__size flex__center__all flex-col'>
            <div className='h-44 w-full flex__center__x gap-3 items-start'>
                <input type="number" className={inputStyle}/>
                <input type="number" className={inputStyle}/>
                <input type="number" className={inputStyle}/>
                <input type="number" className={inputStyle}/>
                <input type="number" className={inputStyle}/>
            </div>
            <div className='primary__btn__holder'>
                <button className='primary__btn click__action hover__action focus__action flex__center__all'><HiOutlineArrowNarrowLeft className='text-3xl'/> BACK</button>
                <button className='primary__btn click__action hover__action focus__action flex__center__all'>NEXT <HiOutlineArrowNarrowRight className='text-3xl'/></button>
            </div>
        </div>
  </div>
  )
}

export default ForgotPass
