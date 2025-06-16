import { ChangePageProps, HeadingProps } from '@/types'
import React from 'react'
import { AiOutlinePlus } from 'react-icons/ai'

type HeadProps = HeadingProps & ChangePageProps;

const Heading: React.FC<HeadProps> = ({ title, btn, setPage, page}) => {
  const changePage = (page: number) => {
    setTimeout(() => {
      setPage(page);
    }, 50);
  }
  return (
    <div className='flex__center__y h-auto w-full text-customViolet mb-3 text-xs'>
        <h2 className='h2__style mr-auto md:text-xl lg:text-lg'>{title}</h2>
        <button className={`${title === "Bulletin" ? 'pl-2 pr-3' : 'px-4'} flex__center__y focus__action hover__action click__action py-2 text-white rounded-sm outline-none bg-customViolet gap-1 md:text-base md:px-5 lg:text-xs lg:px-3`} onClick={() => changePage(page)}>{title === "Bulletin" && (<AiOutlinePlus className='text-base'/>)}{btn}</button>
    </div>
  )
}

export default Heading
