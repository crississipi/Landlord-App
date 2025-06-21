import { CustomInputProps } from '@/types'
import React from 'react'
import { RiUserFill, RiLockPasswordFill } from 'react-icons/ri'

const CustomInput = ({ placeholder, inputType, marginBottom }: CustomInputProps) => {
  return (
    <div className={`flex__center__y h-14 w-full gap-3 px-3 bg-zinc-100 rounded-md ${ marginBottom && 'mb-5' }`}>
      {
        inputType === "text" ? (
          <div className='flex__center__all h-9 min-w-9 max-w-9 rounded-full border-[3px] border-emerald-700 text-emerald-700 overflow-hidden'>
            <RiUserFill className='h-10 w-10 mt-2'/>
          </div>
        ): (
          <div className='h-9 min-w-9 text-emerald-700'>
            <RiLockPasswordFill className='max__size'/>
          </div>
        )
      }
      <input type={inputType} className='max__size text__overflow input__text bg-transparent text-lg' placeholder={placeholder}/>
    </div>
  )
}

export default CustomInput
