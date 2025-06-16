"use client";
import React from 'react'
import { AiFillHeart, AiFillPushpin } from 'react-icons/ai'

const NoticePost = () => {
  return (
    <div className='h-56 min-w-11/12 flex__center__y flex-col bg-zinc-100 rounded-md relative overflow-hidden shadow-sm text-customViolet md:min-w-1/2 md:h-72 lg:w-full lg:h-56'>
      <button className='click__action focus__action hover__action outline-none h-6 w-6 absolute top-2 right-1 p-0.5 rounded-xs hover:text-emerald-700 focus:text-emerald-700 md:h-8 md:w-8 md:top-2.5'>
        <AiFillPushpin className='max__size'/>
      </button>
      <div className='max__size bg-slate-50'></div>
      <div className='flex__center__y h-1/5 w-full text-xs px-3 gap-1 relative md:text-sm md:h-1/4 md:gap-2 lg:max-h-10 lg:text-xs'>
          <button className='flex__center__y click__action outline-none h-full w-auto mr-auto p-1 gap-1 relative text-rose-700 hover:text-rose-600 focus:text-rose-600'>
            <span className='max__size relative md:h-10 md:w-10 lg:h-7 lg:w-7'>
              <AiFillHeart className='max__size' id='showLikesBtn'/>
              <span className='absolute top-1/2 left-1/2 -translate-1/2 text-zinc-100 font-light lg:text-xs'>3</span>
            </span>
            Likes
          </button>
          <p className='text-nowrap'>Seen by</p>
          <div className='flex__center__y h-full gap-0.5 md:gap-1'>
              <div className='h-5 w-5 rounded-full bg-customViolet md:h-7 md:w-7 lg:h-6 lg:w-6'></div>
              <div className='h-5 w-5 rounded-full bg-customViolet md:h-7 md:w-7 lg:h-6 lg:w-6'></div>
              <div className='h-5 w-5 rounded-full bg-customViolet md:h-7 md:w-7 lg:h-6 lg:w-6'></div>
          </div>
          <button className='outline-none font-medium text-nowrap no-underline focus:underline lg:text-xs'>+3 more</button>
      </div>
    </div>
  )
}

export default NoticePost
