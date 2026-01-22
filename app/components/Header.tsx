"use client";

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { RiBellFill, RiMessage2Fill } from 'react-icons/ri'
import { ChangePageProps, HeaderProps } from '@/types'

type HeadProps = HeaderProps & ChangePageProps;
const Header: React.FC<HeadProps> = ({ setNav, setPage, page, login }) => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const showNav = () => {
    setNav("right-0");
  }

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        if (response.ok) {
          const conversations = await response.json();
          const totalUnread = conversations.reduce((sum: number, conv: any) => sum + conv.unreadCount, 0);
          setUnreadMessages(totalUnread);
        }
      } catch (error) {
        console.error('Error fetching unread messages:', error);
      }
    };
    
    fetchUnreadMessages();
    
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          const unreadCount = data.notifications.filter((n: any) => !n.isRead).length;
          setUnreadNotifications(unreadCount);
        }
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };
    
    fetchUnreadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const changePage = (page: number) => {
    setTimeout(() => {
      setPage(page);
    }, 100);
  }
  
  return (
    <div className='h-auto w-full flex items-center z-20 px-5 py-3 gap-5 bg-customViolet lg:bg-white lg:border-b lg:border-gray-200 ease-in-out duration-150 lg:h-16 shadow-md lg:shadow-sm'>
      <button 
        onClick={() => changePage(0)} 
        className='outline-none focus:opacity-80 hover:opacity-90 transition-opacity'
        title="Go to Dashboard"
      >
        <Image src={"/loading_logo.svg"} alt='logo image' height={50} width={50} className='h-11 w-auto object-contain md:h-14 lg:hidden'/>
        <Image src={"/logo.png"} alt='logo image' height={50} width={50} className='hidden lg:block h-10 w-auto object-contain'/>
      </button>

      {page !== 99 && (
        <>
          <button className='h-9 w-9 relative group outline-none ml-auto md:h-11 md:w-11 lg:h-8 lg:w-8' onClick={() => changePage(2)}>
          {unreadMessages > 0 && (
            <span className='h-5 w-5 absolute z-40 bg-emerald-700 -top-1.5 -right-1.5 rounded-full flex__center__all text-xs font-medium text-white group-focus:ring-2 group-focus:ring-zinc-100 ease-in-out duration-150  md:h-6 md:w-6 md:text-sm md:-top-2 md:-right-2 lg:w-4 lg:h-4 lg:-top-[5px] lg:-right-[5px] lg:text-[10px]'>
              {unreadMessages > 99 ? '99+' : unreadMessages}
            </span>
          )}
          <RiMessage2Fill className='max__size click__action text-white lg:text-gray-500 lg:hover:text-customViolet -scale-x-100 group-focus:-scale-x-105' />
        </button>
        <button className='h-9 w-9 relative group outline-none md:h-11 md:w-11 lg:h-8 lg:w-8' onClick={showNav}>
          {unreadNotifications > 0 && (
            <span className='h-5 w-5 absolute z-40 bg-emerald-700 -top-1.5 -right-1.5 rounded-full flex__center__all text-xs font-medium text-white group-focus:ring-2 group-focus:ring-zinc-100 ease-in-out duration-150  md:h-6 md:w-6 md:text-sm md:-top-2 md:-right-2 lg:w-4 lg:h-4 lg:-top-[5px] lg:-right-[5px] lg:text-[10px]'>
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </span>
          )}
          <RiBellFill className='max__size click__action text-white lg:text-gray-500 lg:hover:text-customViolet group-focus:scale-105' />
        </button>
        </>
      )}
    </div>
  )
}

export default Header
