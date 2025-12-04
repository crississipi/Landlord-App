import { ChangePageProps, MessageFingerProps } from '@/types'
import React from 'react'
import Image from 'next/image'

const MessageFinger = ({ 
  setPage, 
  name, 
  lastMessage, 
  lastMessageSender, 
  timestamp, 
  unreadCount,
  userId,
  isOnline,
  profileImage
}: MessageFingerProps & ChangePageProps) => {
  const changePage = (page: number, chatUserId?: number) => {
    setTimeout(() => {
      setPage(page, chatUserId);
    }, 100);
  }

  // Get initials from name for profile display
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };
  
  return (
    <button 
      className='flex__center__y click__action h-16 md:h-20 lg:h-24 w-full px-3 md:px-4 lg:px-5 py-2 md:py-3 gap-3 md:gap-4 outline-none text-sm md:text-base lg:text-lg text-customViolet text-left rounded-md hover:bg-zinc-50 focus:bg-zinc-100 transition-colors' 
      onClick={() => changePage(9, userId)}
    >
      <div className='h-full w-max relative'>
        <div className='h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 min-w-12 md:min-w-14 lg:min-w-16 rounded-full bg-gradient-to-br from-indigo-500 to-customViolet relative flex items-center justify-center text-white font-semibold text-sm md:text-base lg:text-lg overflow-hidden'>
          {profileImage ? (
            <Image 
              src={profileImage} 
              alt={name}
              fill
              className="object-cover h-full w-full"
            />
          ) : (
            getInitials(name)
          )}
        </div>
        {isOnline && (
          <span className='h-3 w-3 md:h-4 md:w-4 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-white z-10'></span>
        )}
      </div>
      
      <div className='flex__center__x h-full w-full flex-col gap-1 md:gap-2 min-w-0'>
        <h6 className='text__overflow w-full font-semibold'>{name}</h6>
        <p className='text__overflow w-full text-xs md:text-sm lg:text-base text-zinc-600 flex gap-2'>
          <span className='font-medium'>{lastMessageSender}:</span>
          <span className='flex-1 min-w-0 truncate'>{lastMessage}</span>
          <span className='text-zinc-400 ml-auto'>{timestamp}</span>
        </p>
      </div>
      {unreadCount > 0 && (
        <div className='h-6 min-w-6 md:h-7 md:min-w-7 lg:h-8 lg:min-w-8 px-2 rounded-full bg-emerald-500 text-white text-xs md:text-sm font-bold flex items-center justify-center'>
          {unreadCount}
        </div>
      )}
    </button>
  )
}

export default MessageFinger