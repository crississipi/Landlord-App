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
      className='w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 group border border-transparent hover:border-gray-100' 
      onClick={() => changePage(9, userId)}
    >
      <div className='relative'>
        <div className='h-14 w-14 md:h-16 md:w-16 lg:h-14 lg:w-14 rounded-full overflow-hidden bg-zinc-100 ring-2 ring-transparent group-hover:ring-customViolet/20 transition-all'>
          {profileImage ? (
            <Image 
              src={profileImage} 
              alt={name}
              fill
              className="object-cover rounded-full"
            />
          ) : (
            <div className='h-full w-full flex items-center justify-center text-customViolet font-bold text-lg'>
              {getInitials(name)}
            </div>
          )}
        </div>
        {isOnline && (
          <span className='h-3.5 w-3.5 rounded-full bg-emerald-500 absolute bottom-0.5 right-0.5 ring-2 ring-white z-10'></span>
        )}
      </div>
      
      <div className='flex-1 min-w-0 text-left'>
        <div className='flex justify-between items-center mb-1'>
          <h6 className='font-semibold text-customViolet text-base md:text-lg lg:text-base truncate pr-2'>{name}</h6>
          <span className='text-xs text-muted whitespace-nowrap'>{timestamp}</span>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-sm lg:text-xs text-gray-500 truncate flex-1 pr-4'>
            <span className='font-medium text-customViolet/80'>{lastMessageSender === 'You' ? 'You: ' : ''}</span>
            {lastMessage}
          </p>
          {unreadCount > 0 && (
            <div className='h-5 min-w-[1.25rem] px-1.5 rounded-full bg-customViolet text-white text-[10px] font-bold flex items-center justify-center shadow-sm shadow-customViolet/30'>
              {unreadCount}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

export default MessageFinger