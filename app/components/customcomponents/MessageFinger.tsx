import { ChangePageProps, MessageFingerProps } from '@/types'
import React from 'react'

const MessageFinger = ({ 
  setPage, 
  name, 
  lastMessage, 
  lastMessageSender, 
  timestamp, 
  unreadCount,
  userId,
  isOnline 
}: MessageFingerProps & ChangePageProps) => {
  const changePage = (page: number, chatUserId?: number) => {
    setTimeout(() => {
      setPage(page, chatUserId);
    }, 100);
  }
  
  return (
    <button 
      className='flex__center__y click__action h-16 w-full px-3 py-2 gap-3 outline-none text-sm text-customViolet text-left rounded-md focus:bg-zinc-100 md:text-base' 
      onClick={() => changePage(9, userId)}
    >
      <div className='h-full min-w-12 rounded-full bg-customViolet relative'>
        {isOnline && (
          <span className='h-3 w-3 rounded-full bg-emerald-700 absolute bottom-0.5 right-0.5 ring-4 ring-white'></span>
        )}
      </div>
      <div className='flex__center__x h-full w-full flex-col gap-1'>
        <h6 className='text__overflow font-medium'>{name}</h6>
        <p className='text__overflow w-full text-xs flex gap-3 md:text-sm'>
          {lastMessageSender}: {lastMessage} 
          <span>{timestamp}</span>
          {unreadCount > 0 && (
            <span className='font-semibold ml-auto text-emerald-700'>
              {unreadCount} new
            </span>
          )}
        </p>
      </div>
    </button>
  )
}

export default MessageFinger