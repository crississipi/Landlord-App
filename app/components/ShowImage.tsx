import { ImageProps } from '@/types';
import React from 'react'
import { AiOutlineClose, AiOutlinePicture } from 'react-icons/ai'
import { showImage } from '@/utils/showImage';

const ShowImage = ({ setImage }: ImageProps) => {

  return (
    <div className='max__size flex__center__y pt-24 flex-col px-5 gap-5 text-white py-2 bg-customViolet/50 fixed top-16 left-0 z-50 overflow-hidden'>
        <div className='h-auto w-full flex justify-end pr-5'>
            <button className='click__action focus__action rounded-full bg-white text-customViolet h-12 w-12 p-1 outline-none' onClick={() => showImage(false, setImage)}>
                <AiOutlineClose className='max__size'/>
            </button>
        </div>
        <div className='flex__center__all h-2/3 aspect-[3/4] rounded-[1.5rem] shadow-lg shadow-customViolet/30 bg-slate-50/50 '>
            <AiOutlinePicture className='text-6xl'/>
        </div>
    </div>
  )
}

export default ShowImage
