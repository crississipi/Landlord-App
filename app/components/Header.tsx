import React from 'react'
import Image from 'next/image'
import { RiBellFill, RiMessage2Fill } from 'react-icons/ri'
import { ChangePageProps, HeaderProps } from '@/types'

type HeadProps = HeaderProps & ChangePageProps;
const Header: React.FC<HeadProps> = ({ login, setNav, setPage }) => {
  const showNav = () => {
    setNav("right-0");
  }
  const changePage = (page: number) => {
    setTimeout(() => {
      setPage(page);
    }, 100);
  }
  return (
    <div className='h-auto w-full flex items-center z-20 px-5 py-3 gap-5 bg-customViolet ease-in-out duration-150 lg:h-14'>
      <Image src={"/loading_logo.svg"} alt='logo image' height={50} width={50} className='h-11 w-auto object-contain md:h-14 lg:h-10'/>
      <button className='h-9 w-9 relative group outline-none ml-auto md:h-11 md:w-11 lg:h-8 lg:w-8' onClick={() => changePage(2)}>
        <span className='h-5 w-5 absolute z-40 bg-emerald-700 -top-1.5 -right-1.5 rounded-full flex__center__all text-xs font-medium text-white group-focus:ring-2 group-focus:ring-zinc-100 ease-in-out duration-150  md:h-6 md:w-6 md:text-sm md:-top-2 md:-right-2 lg:w-4 lg:h-4 lg:-top-[5px] lg:-right-[5px] lg:text-[10px]'>2</span>
        <RiMessage2Fill className='max__size click__action text-white -scale-x-100 group-focus:-scale-x-105' />
      </button>
      <button className='h-9 w-9 relative group outline-none md:h-11 md:w-11 lg:h-8 lg:w-8' onClick={showNav}>
        <span className='h-5 w-5 absolute z-40 bg-emerald-700 -top-1.5 -right-1.5 rounded-full flex__center__all text-xs font-medium text-white group-focus:ring-2 group-focus:ring-zinc-100 ease-in-out duration-150  md:h-6 md:w-6 md:text-sm md:-top-2 md:-right-2 lg:w-4 lg:h-4 lg:-top-[5px] lg:-right-[5px] lg:text-[10px]'>2</span>
        <RiBellFill className='max__size click__action text-white group-focus:scale-105' />
      </button>
    </div>
  )
}

export default Header
