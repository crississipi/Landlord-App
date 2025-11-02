import { CustomInputProps } from '@/types'
import React from 'react'
import { RiUserFill, RiLockPasswordFill } from 'react-icons/ri'

const CustomInput = ({ placeholder, inputType, marginBottom, hookVariable, hookValue }: CustomInputProps) => {
  return (
    <div className={`flex__center__y h-14 w-full gap-3 px-3 border border-white rounded-lg ${ marginBottom && 'mb-5' }`}>
      {
        inputType === "text" ? (
          <div className='flex__center__all h-9 min-w-9 max-w-9 rounded-full border-[2px] border-white text-white overflow-hidden'>
            <RiUserFill className='h-10 w-10 mt-2'/>
          </div>
        ): (
          <div className='h-9 min-w-9 text-white'>
            <RiLockPasswordFill className='max__size'/>
          </div>
        )
      }
      <input 
        type={inputType} 
        className='max__size text__overflow input__text bg-transparent text-lg text-white placeholder:text-white' 
        placeholder={placeholder} 
        value={hookValue} 
        onChange={(e) => hookVariable(e.target.value)}
      />
    </div>
  )
}

export default CustomInput
