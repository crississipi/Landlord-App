"use client";
import React, { useState } from 'react'
import { HiOutlineArrowNarrowRight } from 'react-icons/hi'
import { NoticePost, TitleButton } from './customcomponents';
import { ChangePageProps } from '@/types';

type Bulletin = ChangePageProps;

const BulletinPage: React.FC<Bulletin> = ({ setPage }) => {
  const [pin, setPin] = useState(false);
  const togglePin = () => {
    setPin(!pin);
  }
  return (
    <div className='max__size flex flex-col px-5 gap-3 py-3 text-customViolet overflow-hidden bg-white rounded-t-2xl'>
      <TitleButton setPage={setPage} title="Bulletin"/>
      <div className='max__size flex flex-col gap-5 overflow-x-hidden'>
        <h2 className='h2__style'>Create New Notice</h2>
        <div className='column__align gap-2 text-sm md:text-base'>
          <input type="text" placeholder='Title' className='input__text main__input'/>
          <textarea name="noticeInfo" id="noticeInfo" placeholder='Write a Message...'  className='h-36 input__text main__input'></textarea>
          <div className='w-full flex justify-between text-customViolet mt-1'>
              <div className='flex__center__y gap-2 font-light text-sm md:text-base md:gap-3 md:font-normal'>
                  <span>Pin to all</span>
                  <button className={`rounded-full h-6 w-12 p-1 bg-zinc-100 outline-none relative md:h-8 md:w-16`} onClick={togglePin}>
                      <div className={`h-4 w-4 rounded-full absolute top-1/2 -translate-y-1/2 md:h-6 md:w-6 ${pin ? 'left-7 bg-emerald-700 md:left-9' : 'left-1 bg-customViolet'} click__action`}></div>
                  </button>
              </div>
              <button className='flex__center__all focus__action hover__action click__action py-2 px-3 text-white rounded-sm outline-none bg-customViolet gap-5 text-sm md:text-base'>Post <HiOutlineArrowNarrowRight className='text-base'/></button>
          </div>
        </div>
        <h2 className='h2__style mt-5'>Posted Notices</h2>
        <div className='column__align gap-3 md:grid md:grid-cols-2 pb-2'>
          <NoticePost />
          <NoticePost />
          <NoticePost />
          <NoticePost />
          <NoticePost />
        </div>
      </div>
    </div>
  )
}

export default BulletinPage