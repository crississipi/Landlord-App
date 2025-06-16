import React from 'react'
import { NoticePost } from './customcomponents';

const Bulletin = () => {
  return (
    <div className='column__align'>
      <div className='min-h-max w-full flex__center__y gap-3 text-emerald-700 pb-2 overflow-y-hidden md:h-72 lg:grid lg:grid-cols-4 lg:overflow-y-auto'>
        <NoticePost />
        <NoticePost />
        <NoticePost />
        <NoticePost />
        <NoticePost />
      </div>

    </div>
  )
}

export default Bulletin
