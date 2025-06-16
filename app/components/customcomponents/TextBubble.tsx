import { CustomTextBubbleProps } from '@/types'
import React from 'react'
import { TbTriangleFilled } from 'react-icons/tb'

const CustomTextBubble = ({ location, pointer }:CustomTextBubbleProps) => {
  console.log(location);
  return (
    <div className={`h-auto w-auto max-w-48 absolute ${location} z-50`}>
      <div className={`w-full h-4 flex px-1 ${pointer}`}>
        <TbTriangleFilled className='text-customViolet'/>
      </div>
      <div className='max__size rounded-xs  bg-customViolet -mt-[10px] py-1 px-2 text-white text-xs font-light'>
        Dela Cruz, Demarcus, John
      </div>
    </div>
  )
}

export default CustomTextBubble