import { ChangePageProps, TenantProps } from '@/types'
import React from 'react'
import Image from 'next/image';
import { AiOutlineRight } from 'react-icons/ai';

type Tenant = TenantProps & ChangePageProps;
const Tenant:React.FC<Tenant> = ({ setPage, name, profile }) => {
  const changePage = (page: number) => {
    setTimeout(() => {
      setPage(page);
    }, 100);
  }
  return (
    <button className="flex__center__y gap-3 w-full text-sm outline-none py-2 px-3 focus:bg-white md:px-5 md:py-2 group" onClick={() => changePage(7)}>
        <div className='flex__center__all h-9 min-w-9  max-w-9 rounded-full  bg-sky-500 overflow-hidden text-white md:h-8 md:min-w-8'>
            <Image alt='Profile Picture' src={profile} height={100} width={100} className='h-full w-full object-cover object-center'/>
        </div>
        <span className='text__overflow w-full text-left'>{name}</span>
        <AiOutlineRight className='text-2xl p-1 rounded-full text-emerald-700 group-focus:bg-customViolet group-focus:text-white ease-in-out duration-150'/>
    </button>
  )
}

export default Tenant
