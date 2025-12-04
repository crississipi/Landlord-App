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
      <div className='max__size flex flex-col text-customViolet gap-5 px-5 py-3 bg-white rounded-t-2xl'>
        <TitleButton setPage={setPage} title="Messages"/>
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
    <div className='max__size flex flex-col text-customViolet gap-5 px-5 py-3 md:px-8 lg:px-10 bg-white rounded-t-2xl overflow-hidden'>
      <TitleButton setPage={setPage} title="Messages"/>
      
      {error && (
        <div className='w-full bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm'>
          {error}
        </div>
      )}
      
      {/* Chat Heads - Show ONLY online tenants */}
      <div className='w-full'>
        <div className='h-auto w-full flex overflow-x-auto overflow-y-hidden no-scrollbar gap-3 pb-2 md:gap-4 lg:gap-5'>
          {onlineTenants.length > 0 ? (
            onlineTenants.map((tenant) => (
              <ChatHead 
                key={tenant.userID}
                setPage={setPage} 
                name={tenant.name}
                userId={tenant.userID}
                isOnline={tenant.isOnline}
                profileImage={tenant.profileImage}
              />
            ))
          ) : (
            <div className="w-full text-center py-4 md:py-6">
              <p className="text-sm md:text-base text-zinc-500">No tenants online at the moment</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Message List - Show ALL conversations sorted by most recent */}
      <div className='w-full flex flex-col flex-1 overflow-hidden'>
        <div className='flex items-center mb-3 gap-3 md:gap-4'>
          <button 
          type="button" 
          className={`font-medium tracking-wide text-sm md:text-base py-1.5 px-5 md:px-6 rounded-full transition-all ${messageOptions === "All" ? "bg-customViolet text-white" : "bg-customViolet/10 text-customViolet hover:bg-customViolet/20"}`} 
          onClick={() => setMessageOptions("All")}>All</button>
          <button 
          type="button" 
          className={`font-medium tracking-wide text-sm md:text-base py-1.5 px-5 md:px-6 rounded-full transition-all ${messageOptions === "Unread" ? "bg-customViolet text-white" : "bg-customViolet/10 text-customViolet hover:bg-customViolet/20"}`} 
          onClick={() => setMessageOptions("Unread")}>Unread</button>
          <button 
          type="button" 
          className={`font-medium tracking-wide text-sm md:text-base py-1.5 px-5 md:px-6 rounded-full transition-all ${messageOptions === "Archived" ? "bg-customViolet text-white" : "bg-customViolet/10 text-customViolet hover:bg-customViolet/20"}`} 
          onClick={() => setMessageOptions("Archived")}>Archived</button>
        </div>
        <div className='w-full flex flex-col gap-1 md:gap-2 overflow-y-auto pr-1'>
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
            <div className="text-center py-12 md:py-16 bg-zinc-50 rounded-xl">
              <div className="text-6xl md:text-7xl mb-3">💬</div>
              <p className="text-zinc-600 font-medium text-base md:text-lg">No conversations yet</p>
              <p className="text-zinc-400 text-sm md:text-base mt-1">Start chatting with online tenants above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessagesPage