"use client";

import React, { useState } from 'react'
import {  AiOutlineSearch } from 'react-icons/ai'
import { AccountSlip, ChatHead, MessageFinger, TitleButton } from './customcomponents'
import { ChangePageProps } from '@/types';

const MessagesPage = ({ setPage }: ChangePageProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const toggleSearch = () => {
    setShowSearch(!showSearch);
  }

  return (
    <div className='max__size flex flex-col text-customViolet gap-5 px-5 py-3 bg-white rounded-t-2xl'>
      <TitleButton setPage={setPage} title="Messages"/>
      <div className='h-auto w-full flex overflow-y-hidden no-scrollbar px-2 py-2'>
        <ChatHead setPage={setPage} name='Juan Dela Cruz'/>
        <ChatHead setPage={setPage} name='Devon De Guzman'/>
        <ChatHead setPage={setPage} name='Kyle Lowry'/>
        <ChatHead setPage={setPage} name='Steph Curry'/>
        <ChatHead setPage={setPage} name='Lebron James'/>
        <ChatHead setPage={setPage} name='Lebron James'/>
      </div>
      <div className='w-full flex flex-col gap-2'>
        <MessageFinger setPage={setPage}/>
        <MessageFinger setPage={setPage}/>
        <MessageFinger setPage={setPage}/>
        <MessageFinger setPage={setPage}/>
        <MessageFinger setPage={setPage}/>
      </div>
    </div>
  )
}

export default MessagesPage
