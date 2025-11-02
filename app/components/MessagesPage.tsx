"use client";

import React, { useEffect, useState } from 'react'
import { ChatHead, MessageFinger, TitleButton } from './customcomponents'
import { ChangePageProps, Conversation } from '@/types';

const MessagesPage = ({ setPage }: ChangePageProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
    fetchUsers();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return '~' + Math.round(diffInHours * 60) + 'min';
    } else if (diffInHours < 24) {
      return '~' + Math.round(diffInHours) + 'h';
    } else {
      return '~' + Math.round(diffInHours / 24) + 'd';
    }
  };

  if (loading) {
    return (
      <div className='max__size flex flex-col text-customViolet gap-5 px-5 py-3 bg-white rounded-t-2xl'>
        <TitleButton setPage={setPage} title="Messages"/>
        <div className="flex justify-center items-center h-32">
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='max__size flex flex-col text-customViolet gap-5 px-5 py-3 bg-white rounded-t-2xl'>
      <TitleButton setPage={setPage} title="Messages"/>
      
      {/* Chat Heads - Show recent conversations */}
      <div className='h-auto w-full flex overflow-y-hidden no-scrollbar px-2 py-2'>
        {conversations.slice(0, 6).map((conversation) => (
          <ChatHead 
            key={conversation.partner.userID}
            setPage={setPage} 
            name={conversation.partner.name}
            userId={conversation.partner.userID}
            isOnline={conversation.partner.isOnline}
          />
        ))}
        {conversations.length === 0 && (
          <p className="text-sm text-gray-500">No conversations yet</p>
        )}
      </div>
      
      {/* Message List */}
      <div className='w-full flex flex-col gap-2'>
        {conversations.map((conversation) => (
          <MessageFinger 
            key={conversation.partner.userID}
            setPage={setPage}
            name={conversation.partner.name}
            lastMessage={conversation.lastMessage}
            lastMessageSender={conversation.lastMessageSender}
            timestamp={formatTime(conversation.timestamp)}
            unreadCount={conversation.unreadCount}
            userId={conversation.partner.userID} // ✅ This is passed
            isOnline={conversation.partner.isOnline}
          />
        ))}
        {conversations.length === 0 && (
          <p className="text-center text-gray-500 py-4">Start a conversation by selecting a user</p>
        )}
      </div>
    </div>
  )
}

export default MessagesPage