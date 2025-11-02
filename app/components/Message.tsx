import React, { useEffect, useState, useRef } from 'react'
import { AiFillFolderOpen, AiFillPicture, AiOutlineInfoCircle, AiOutlineLeft, AiOutlineSend } from 'react-icons/ai'
import { MessageBubble } from './customcomponents'
import { ChangePageProps, ChatInfoProps, MessageType } from '@/types'

type ChatProps = ChatInfoProps & ChangePageProps & {
  chatUserId?: number;
};

const Message: React.FC<ChatProps> = ({ setPage, setChatInfo, chatUserId }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
    console.log('chatUserId changed:', chatUserId);
    if (chatUserId) {
      fetchMessages();
      fetchPartnerInfo();
    } else {
      setLoading(false);
    }
  }, [chatUserId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      console.log('Fetching messages for user:', chatUserId);
      const response = await fetch(`/api/messages/${chatUserId}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched messages:', data);
        setMessages(data);
      } else {
        console.error('Failed to fetch messages:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerInfo = async () => {
    try {
      console.log('Fetching partner info for user:', chatUserId);
      const response = await fetch(`/api/users/${chatUserId}`);
      console.log('Partner response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched partner:', data);
        setPartner(data);
      } else {
        console.error('Failed to fetch partner info:', response.status);
      }
    } catch (error) {
      console.error('Error fetching partner info:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatUserId) return;

    try {
      console.log('Sending message to:', chatUserId, 'Message:', newMessage);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverID: chatUserId,
          message: newMessage
        })
      });

      console.log('Send message response status:', response.status);
      
      if (response.ok) {
        setNewMessage('');
        fetchMessages(); // Refresh messages
      } else {
        console.error('Failed to send message:', response.status);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showChatInfo = () => {
    setChatInfo("right-0");
  };

  const changePage = (page: number) => {
    setTimeout(() => {
      setPage(page);
    }, 100);
  };

  return (
    <div className='max__size flex__center__y flex-col text-customViolet justify-start overflow-hidden bg-white rounded-t-2xl'>
      {/* Header */}
      <div className='h-20 w-full bg-white shadow-sm shadow-zinc-100 flex items-center px-5 gap-3 sticky top-0'>
        <button className='focus__action hover__action click__action rounded-sm h-9 w-9 p-1 outline-none' onClick={() => changePage(2)}>
         <AiOutlineLeft className='max__size text-emerald-700'/>
        </button>
        <div className='flex__center__y gap-3'>
            <div className='h-9 min-w-9 rounded-full bg-customViolet relative md:h-11 md:min-w-11'>
            </div>
            <p className='column__align text-base font-medium md:text-lg'>
            {partner ? `${partner.firstName} ${partner.lastName}` : 'Loading...'}
            <span className='text-xs font-normal md:text-sm'>
              {partner?.isOnline ? 'Active Now' : 'Offline'}
            </span>
            </p>
        </div>
        <button className='focus__action hover__action click__action ml-auto h-7 min-w-7 text-emerald-700 rounded-full outline-none md:h-9 md:w-9' onClick={showChatInfo}>
            <AiOutlineInfoCircle className='max__size'/>
        </button>
      </div>

      {/* Messages */}
      <div className='h-full w-full overflow-x-hidden relative'>
        <div className='column__align gap-3 p-4'>
          {messages.map((message) => (
            <MessageBubble 
              key={message.messageID}
              sender={message.senderID !== chatUserId}
              message={message.message}
              timestamp={message.dateSent}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className='h-24 w-full flex items-start pl-3 pr-2 pt-2 md:gap-3'>
        <button className='flex__center__y click__action h-10 min-w-10 p-1 text-emerald-700 rounded-sm outline-none mt-2 focus:bg-zinc-100 focus:scale-105 md:h-11 md:min-w-11'>
            <AiFillFolderOpen className='max__size'/>
        </button>
        <button className='flex__center__y click__action h-10 min-w-10 p-1 text-emerald-700 rounded-sm outline-none mt-2 focus:bg-zinc-100 focus:scale-105 md:h-11 md:min-w-11'>
            <AiFillPicture className='max__size'/>
        </button>
        <input 
          type="text" 
          placeholder='Write a Message...' 
          className='input__text h-14 w-full rounded-xl bg-zinc-100 px-3 py-2 mx-1 md:text-base'
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className='flex__center__y click__action h-10 min-w-10 p-1 ml-1 text-emerald-700 rounded-sm outline-none mt-2 focus:bg-zinc-100 focus:scale-105 md:h-11 md:min-w-11'
          onClick={sendMessage}
        >
            <AiOutlineSend className='max__size'/>
        </button>
      </div>
    </div>
  )
}

export default Message