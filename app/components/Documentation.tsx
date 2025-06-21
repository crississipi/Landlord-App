import { ChangePageProps, ImageProps } from '@/types'
import React, { useRef, useState } from 'react';
import { AiOutlineLeft, AiOutlinePlus } from 'react-icons/ai';
import { HiOutlineArrowNarrowLeft, HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { ImageButton } from './customcomponents';

type DocuProps = ChangePageProps & ImageProps;

const Documentation: React.FC<DocuProps> = ({ setPage, setImage }) => {
  const changePage = (page: number) => {
    setTimeout(() => {
      setPage(page);
    }, 100);
  }
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedImg, setSelectedImg] = useState<string[]>([]);

  const accessFile = () => { inputRef.current?.click(); }

  const fileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(selectedImg.length >= 8) return;

    const files = event.target.files;
    const newImageURLs: string[] = [];

    if(!files) return;

    Array.from(files).forEach((file) => {
      if(file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        newImageURLs.push(imageUrl);
      }
    });

    setSelectedImg((prev) => [...prev, ...newImageURLs]);
  }
  return (
    <div className='max__size flex flex-col px-5 gap-5 text-customViolet py-3 text-sm bg-white rounded-t-2xl md:text-base'>
      <div className='h-auto w-full flex__center__y gap-3'>
        <button className='rounded-sm h-9 w-9 p-1 focus__action hover__action click__action outline-none' onClick={() => changePage(4)}>
          <AiOutlineLeft className='max__size text-emerald-700'/>
        </button>
        <h1 className='h1__style'>Documentation</h1>
      </div>
      <h2 className='h2__style mt-3'>Insert Images</h2>
      <div className='h-auto w-full grid grid-cols-4 gap-3 rounded-sm'>
        <div className='col-span-full w-full flex__center__y gap-3 px-1'>
          <button className='focus__action hover__action click__action flex__center__all h-20 min-w-20 outline-none rounded-sm bg-zinc-50 border border-zinc-200 text-emerald-700 md:h-36 md:w-42' onClick={accessFile}>
            <AiOutlinePlus className='text-4xl md:text-5xl'/>
            <input 
              type="file" 
              ref={inputRef} 
              accept='image/*' 
              multiple 
              className='hidden' 
              onChange={fileChange}
            />
          </button>
          <span className='text-zinc-400'>Include images of before and after repairing the broken item. Attach at least 2 images. Maximum of 8 images only.</span>
        </div>
        {selectedImg.map((url, i) => (
          <ImageButton 
            key={i} 
            setImage={setImage} 
            removable={true} 
            imageURL={url}
            setSelectedImg={setSelectedImg}
          />
        ))}
      </div>
      <h2 className='h2__style mt-5'>Remarks</h2>
      <textarea name="noticeInfo" id="noticeInfo" placeholder='Write a Message...'  className='h-82 w-full input__text text-base border border-zinc-400 rounded-sm px-3 py-2 mb-5'></textarea>

      <div className='w-full flex justify-end gap-2 sticky top-full md:items-center md:justify-center md:mt-10'>
        <button className='click__action hover__action focus__action flex__center__y border border-zinc-400 rounded-sm gap-3 text-zinc-400 justify-between px-5 md:gap-5'>
          <HiOutlineArrowNarrowLeft className='text-2xl'/> 
          Cancel
        </button>

        <button className='primary__btn click__action hover__action focus__action flex__center__y justify-between px-5 md:gap-5'>
          Confirm 
          <HiOutlineArrowNarrowRight className='text-2xl'/>
        </button>
      </div>
    </div>
  )
}

export default Documentation
