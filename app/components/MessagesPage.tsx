"use client";

import React, { useEffect, useState } from 'react'
import { ChatHead, MessageFinger, TitleButton } from './customcomponents'
import { ChangePageProps, Conversation } from '@/types';

interface OnlineTenant {
  userID: number;
  name: string;
  isOnline: boolean;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string | null;
}

const MessagesPage = ({ setPage }: ChangePageProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [onlineTenants, setOnlineTenants] = useState<OnlineTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageOptions, setMessageOptions] = useState<"All" | "Unread" | "Archived">("All")

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch conversations and online tenants in parallel
      const [conversationsRes, tenantsRes] = await Promise.all([
        fetch('/api/messages'),
        fetch('/api/users')
      ]);

      if (conversationsRes.ok) {
        const conversationsData = await conversationsRes.json();
        setConversations(conversationsData);
      } else {
        console.error('Error fetching conversations');
      }

      if (tenantsRes.ok) {
        const tenantsData = await tenantsRes.json();
        setOnlineTenants(tenantsData);
      } else {
        console.error('Error fetching online tenants');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const mins = Math.round(diffInHours * 60);
      return mins > 0 ? `${mins}min` : 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.round(diffInHours)}h`;
    } else {
      return `${Math.round(diffInHours / 24)}d`;
    }
  };

  if (loading) {
    return (
      <div className='max__size flex flex-col text-customViolet lg:text-gray-800 gap-5 p-6 bg-gray-50/50 lg:bg-gray-50'>
        <div className="lg:hidden">
          <TitleButton setPage={setPage} title="Messages"/>
        </div>
        <h1 className="hidden lg:block text-2xl font-semibold text-gray-800 mb-4">Messages</h1>
        <div className="flex justify-center items-center h-32">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-customViolet border-t-transparent rounded-full animate-spin" />
            <p className="text-customViolet/70">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max__size flex flex-col text-customViolet lg:text-gray-800 gap-6 p-4 md:p-6 lg:p-8 bg-gray-50/50 lg:bg-gray-50'>
      <div className="lg:hidden">
        <TitleButton setPage={setPage} title="Messages"/>
      </div>
      <h1 className="hidden lg:block text-2xl lg:text-xl font-semibold text-gray-800">Messages</h1>
      
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 h-full">
        {/* Left Side: Online Tenants (Desktop) / Top (Mobile) */}
        <div className='w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-4'>
          <h2 className="hidden lg:block font-medium text-lg lg:text-base text-gray-700">Online Tenants</h2>
          <div className='h-auto w-full flex lg:grid lg:grid-cols-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[calc(100vh-200px)] overflow-y-hidden no-scrollbar gap-4 pb-4 lg:pb-0'>
            {onlineTenants.length > 0 ? (
              onlineTenants.map((tenant) => (
                <div key={tenant.userID} className="shrink-0">
                  <ChatHead 
                    setPage={setPage} 
                    name={tenant.name}
                    userId={tenant.userID}
                    isOnline={tenant.isOnline}
                    profileImage={tenant.profileImage}
                  />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-4 md:py-6">
                <p className="text-sm md:text-base text-zinc-500">No tenants online at the moment</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Side: Message List */}
        <div className='w-full lg:w-2/3 xl:w-3/4 flex flex-col flex-1 overflow-hidden bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-2 md:p-4 lg:h-[calc(100vh-180px)]'>
          <div className='flex items-center mb-4 gap-3 px-2 pt-2'>
            <button 
            type="button" 
            className={`font-medium tracking-wide text-sm py-2 px-6 rounded-full transition-all duration-300 ${messageOptions === "All" ? "bg-customViolet text-white shadow-lg shadow-customViolet/20" : "bg-transparent text-customViolet hover:bg-gray-50"}`} 
            onClick={() => setMessageOptions("All")}>All</button>
            <button 
            type="button" 
            className={`font-medium tracking-wide text-sm py-2 px-6 rounded-full transition-all duration-300 ${messageOptions === "Unread" ? "bg-customViolet text-white shadow-lg shadow-customViolet/20" : "bg-transparent text-customViolet hover:bg-gray-50"}`} 
            onClick={() => setMessageOptions("Unread")}>Unread</button>
            <button 
            type="button" 
            className={`font-medium tracking-wide text-sm py-2 px-6 rounded-full transition-all duration-300 ${messageOptions === "Archived" ? "bg-customViolet text-white shadow-lg shadow-customViolet/20" : "bg-transparent text-customViolet hover:bg-gray-50"}`} 
            onClick={() => setMessageOptions("Archived")}>Archived</button>
          </div>
          <div className='w-full flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar flex-1'>
            {conversations.length > 0 ? (
              conversations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((conversation) => (
                <MessageFinger 
                  key={conversation.partner.userID}
                  setPage={setPage}
                  name={conversation.partner.name}
                  lastMessage={conversation.lastMessage}
                  lastMessageSender={conversation.lastMessageSender}
                  timestamp={formatTime(conversation.timestamp)}
                  profileImage={conversation.partner.profileImage}
                  unreadCount={conversation.unreadCount}
                  userId={conversation.partner.userID}
                  isOnline={conversation.partner.isOnline}
                />
              ))
            ) : (
              <div className="text-center py-12 md:py-16 m-auto">
                <div className="text-6xl md:text-7xl mb-4 opacity-20">💬</div>
                <p className="text-zinc-600 font-medium text-base md:text-lg">No conversations yet</p>
                <p className="text-zinc-400 text-sm md:text-base mt-1">Start chatting with online tenants above</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessagesPage