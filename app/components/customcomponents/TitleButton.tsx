import { ChangePageProps, TitleButtonProps } from '@/types'
import React from 'react'
import { AiOutlineLeft } from 'react-icons/ai'

type SetBtn = TitleButtonProps & ChangePageProps;
const TitleButton: React.FC<SetBtn> = ({ title, setPage }) => {
  const changePage = (page: number) => {
    setTimeout(() => {
      setPage(page);
    }, 50);
  }
  return (
    <button className='flex__center__y click__action mt-1 h-9 md:h-10 lg:h-12 w-auto outline-none rounded-sm text-emerald-700 gap-2 md:gap-3 group' onClick={() => changePage(0)}>
        <div className='click__action rounded-sm min-h-full w-9 md:w-10 lg:w-12 p-1 group-focus:ring-2 group-focus:ring-customViolet/50 group-focus:scale-105 group-hover:ring-2 group-hover:ring-customViolet/20 transition-all'>
          <AiOutlineLeft className='max__size text-emerald-700'/>
        </div>
        {title && (<h1 className='h1__style click__action text-customViolet group-focus:text-emerald-700 group-focus:font-normal text-xl md:text-2xl lg:text-3xl'>{title}</h1>)}
    </button>
  )
}

export default TitleButton
