"use client";

import { MessageBubbleProps } from '@/types';
import React, {useState} from 'react'

const MessageBubble = ({ sender }: MessageBubbleProps) => {
  const [details, setDetails] = useState(false);
  const toggleDetails = () => {
    setDetails(!details);
  }
  return (
    <button className={`column__align click__action outline-none overflow-hidden text-customViolet text-sm px-3 ${!sender ? 'items-start' : 'items-end'} md:text-base`} onClick={toggleDetails}>
      {details && (<span className='text-xs font-semibold py-1 px-3 mx-10 md:text-sm'>11:45am</span>)}
      <div className={`h-auto w-full flex items-end gap-2 ${sender && 'flex-row-reverse'}`}>
        <div className='h-7 min-w-7 rounded-full bg-customViolet'></div>
        <div className={`px-3 py-2 w-3/4 ${!sender ? 'rounded-r-xl rounded-tl-xl bg-emerald-700/50': 'rounded-l-xl rounded-tr-xl bg-customViolet/50'} text-white text-left font-light tracking-wide`}>
          <p>Hello User! This is an automated chat upon creation of your account.</p>
        </div>
      </div>
      {details && (<span className='text-xs py-1 mx-10 md:text-sm md:font-light'>Seen 27 minutes ago</span>)}
    </button>
  )
}

export default MessageBubble

