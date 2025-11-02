"use client";

import { MessageBubbleProps } from '@/types';
import React, {useState} from 'react'

const MessageBubble = ({ sender, message, timestamp }: MessageBubbleProps) => {
  const [details, setDetails] = useState(false);
  const toggleDetails = () => {
    setDetails(!details);
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <button 
      className={`column__align click__action outline-none overflow-hidden text-customViolet text-sm px-3 ${!sender ? 'items-start' : 'items-end'} md:text-base`} 
      onClick={toggleDetails}
    >
      {details && (
        <span className='text-xs font-semibold py-1 px-3 mx-10 md:text-sm'>
          {formatDate(timestamp)} {formatTime(timestamp)}
        </span>
      )}
      <div className={`h-auto w-full flex items-end gap-2 ${sender && 'flex-row-reverse'}`}>
        <div className={`px-3 py-2 w-3/4 ${!sender ? 'rounded-r-xl rounded-tl-xl bg-emerald-700/50': 'rounded-l-xl rounded-tr-xl bg-customViolet/50'} text-white text-left font-light tracking-wide`}>
          <p>{message}</p>
        </div>
      </div>
      {details && (
        <span className='text-xs py-1 mx-10 md:text-sm md:font-light'>
          Sent {formatTime(timestamp)}
        </span>
      )}
    </button>
  )
}

export default MessageBubble