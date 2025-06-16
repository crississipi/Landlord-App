import { ImageProps } from '@/types'
import { showImage } from '@/utils/showImage';
import React from 'react';
import Image from 'next/image';
import { AiFillCloseCircle, AiOutlinePicture } from 'react-icons/ai'

const ImageButton = ({ setImage, removable, allMedia, k, imageURL, setSelectedImg }: ImageProps) => {
  const removeImage = (imgURL: string) => {
    setSelectedImg?.((prev) => prev.filter((url) => url !== imgURL));
    URL.revokeObjectURL(imgURL);
  }
  return (
    <div key={k} className={`${allMedia ? 'h-40' : 'aspect-square md:h-36'} col-span-1 relative`}>
      <button className='max__size click__action flex__center__all rounded-sm border border-zinc-200 focus:bg-zinc-100 focus:shadow-md outline-none text-customViolet/70' onClick={() => showImage(true, setImage)}>
        { imageURL ? 
          (<Image height={100} width={100} src={imageURL} alt='documentation image' className='aspect-square object-center object-cover'/>) :
          (<AiOutlinePicture className='text-4xl'/>)
        }
      </button>
      { removable && (
        <button className='click__action h-7 w-7 rounded-full absolute -top-2 -right-2 text-rose-800 bg-white outline-none focus:text-rose-700 focus:scale-105' onClick={() => removeImage(imageURL ?? '')}>
          <AiFillCloseCircle className='max__size'/>
        </button>
      )}
    </div>
  )
}

export default ImageButton
