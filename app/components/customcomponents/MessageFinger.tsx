import { ChangePageProps } from '@/types'
import React from 'react'

const MessageFinger = ({ setPage }:ChangePageProps ) => {
  const changePage = (page: number) => {
    setTimeout(() => {
      setPage(page);
    }, 100);
  }
  return (
    <button className='flex__center__y click__action h-16 w-full px-3 py-2 gap-3 outline-none text-sm text-customViolet text-left rounded-md focus:bg-zinc-100 md:text-base' onClick={() => changePage(9)}>
      <div className='h-full min-w-12 rounded-full bg-customViolet relative'>
        <span className='h-3 w-3 rounded-full bg-emerald-700 absolute bottom-0.5 right-0.5 ring-4 ring-white'></span>
      </div>
      <div className='flex__center__x h-full w-full flex-col gap-1'>
        <h6 className='text__overflow font-medium'>Juan Dela Cruz</h6>
        <p className='text__overflow w-full text-xs flex gap-3 md:text-sm'>You: Yes <span>~30min</span><span className='font-semibold ml-auto'>seen</span></p>
      </div>
    </button>
  )
}

export default MessageFinger
