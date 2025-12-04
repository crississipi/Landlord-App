import React, { useEffect, useState, useRef } from 'react'
import { AiFillFolderOpen, AiFillPicture, AiOutlineInfoCircle, AiOutlineLeft, AiOutlineClose, AiOutlinePlusCircle } from 'react-icons/ai'
import { IoSend } from "react-icons/io5";
import { HiOutlineDocument } from 'react-icons/hi'
import { MessageBubble } from './customcomponents'
import { ChangePageProps, ChatInfoProps, MessageType } from '@/types'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion';

type ChatProps = ChatInfoProps & ChangePageProps & {
  chatUserId?: number;
};

const Message: React.FC<ChatProps> = ({ setPage, setChatInfo, chatUserId }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // File preview states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
        setShowPreview(true);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
      setShowPreview(true);
    }
  };

  // Cancel file selection
  const cancelFileUpload = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setShowPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // Send file with message
  const sendFileMessage = async () => {
    if (!selectedFile || !chatUserId) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('receiverID', chatUserId.toString());
      if (newMessage.trim()) {
        formData.append('message', newMessage);
      }

      const response = await fetch('/api/messages/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setNewMessage('');
        cancelFileUpload();
        fetchMessages();
      } else {
        console.error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      <div className='h-20 md:h-24 w-full bg-white shadow-sm shadow-zinc-100 flex items-center px-5 md:px-8 lg:px-10 gap-3 md:gap-4 sticky top-0 z-10'>
        <button className='focus__action hover__action click__action rounded-sm h-9 w-9 md:h-10 md:w-10 p-1 outline-none' onClick={() => changePage(2)}>
         <AiOutlineLeft className='max__size text-emerald-700'/>
        </button>
        <div className='flex__center__y gap-3 md:gap-4'>
            <div className='h-11 min-w-11 rounded-full bg-customViolet relative md:h-14 md:min-w-14 lg:h-16 lg:min-w-16 font-bold text-white text-base md:text-lg lg:text-xl flex items-center justify-center overflow-hidden'>
              {partner?.profileImage ? (
                <Image 
                  src={partner.profileImage} 
                  alt={partner.name ?? 'Profile Image'}
                  fill
                  className="object-cover object-top"
                />
              ) : (
                partner?.name.substring(0, 2)
              )}
            </div>
            <p className='column__align text-base font-medium md:text-lg lg:text-xl'>
            {partner ? `${partner.firstName} ${partner.lastName}` : 'Loading...'}
            <span className='text-xs font-normal md:text-sm lg:text-base'>
              {partner?.isOnline ? 'Active Now' : 'Offline'}
            </span>
            </p>
        </div>
        <button className='focus__action hover__action click__action ml-auto h-7 min-w-7 text-emerald-700 rounded-full outline-none md:h-10 md:w-10 lg:h-11 lg:w-11' onClick={showChatInfo}>
            <AiOutlineInfoCircle className='max__size'/>
        </button>
      </div>

      {/* Messages */}
      <div className='h-full w-full overflow-x-hidden relative'>
        <div className='absolute h-full w-full flex items-center justify-center bg-gradient-to-tr from-blue-200 via-indigo-50 to-customViolet/30 opacity-30'>
          <Image
            src='/logo.png'
            alt='background'
            height={4096}
            width={4096}
            className="object-contain object-center h-40 w-40 aspect-square"
          />
        </div>
        <div className='column__align gap-3 p-4 md:p-6 lg:p-8 z-50 max-w-5xl mx-auto w-full'>
          {messages.map((message) => (
            <MessageBubble 
              key={message.messageID}
              sender={message.senderID !== chatUserId}
              message={message.message}
              timestamp={message.dateSent}
              files={message.files}
              batchId={message.batchId}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* File Preview Modal */}
      {showPreview && selectedFile && (
        <div className='absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl max-w-md w-full p-6 shadow-2xl'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-customViolet'>Preview File</h3>
              <button 
                onClick={cancelFileUpload}
                className='p-2 hover:bg-zinc-100 rounded-full transition-colors'
              >
                <AiOutlineClose className='text-xl text-zinc-600' />
              </button>
            </div>
            
            {/* Preview Content */}
            <div className='mb-4'>
              {filePreview ? (
                <img 
                  src={filePreview} 
                  alt="Preview" 
                  className='w-full h-64 object-contain bg-zinc-100 rounded-lg'
                />
              ) : (
                <div className='w-full h-64 bg-zinc-100 rounded-lg flex flex-col items-center justify-center'>
                  <HiOutlineDocument className='text-6xl text-customViolet mb-2' />
                  <p className='text-sm text-zinc-600 font-medium'>{selectedFile.name}</p>
                  <p className='text-xs text-zinc-400 mt-1'>{formatFileSize(selectedFile.size)}</p>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className='bg-zinc-50 rounded-lg p-3 mb-4'>
              <p className='text-sm font-medium text-zinc-700 truncate'>{selectedFile.name}</p>
              <p className='text-xs text-zinc-500 mt-1'>
                {selectedFile.type || 'Unknown type'} • {formatFileSize(selectedFile.size)}
              </p>
            </div>

            {/* Message Input */}
            <input
              type="text"
              placeholder="Add a caption (optional)..."
              className='w-full px-4 py-2 border border-zinc-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-customViolet'
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />

            {/* Action Buttons */}
            <div className='flex gap-2'>
              <button
                onClick={cancelFileUpload}
                className='flex-1 px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors'
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={sendFileMessage}
                disabled={uploading}
                className='flex-1 px-4 py-2 bg-customViolet text-white rounded-lg hover:bg-customViolet/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <IoSend />
                    Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className='h-24 md:h-28 w-full flex items-start pl-3 pr-2 pt-2 md:px-8 lg:px-10 md:gap-3 shadow-[0px_-5px_10px_#574964] relative z-20'>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="*/*"
        />
        <input
          ref={imageInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*"
        />
        <AnimatePresence mode='wait'>
          {showMore ?? (
            <motion.div 
              initial={{y: -300}}
              animate={{y: 0}}
              exit={{y: -300}}
              transition={{duration: 0.3}}
              className='absolute top-0 -mt-16 bg-white rounded-xl px-3 py-2 flex gap-1 shadow-xl'>
                <button 
                  className='flex__center__y click__action h-10 min-w-10 p-1 text-customViolet rounded-sm outline-none focus:bg-zinc-100 focus:scale-105 md:h-11 md:min-w-11'
                  onClick={() => fileInputRef.current?.click()}
                >
                    <AiFillFolderOpen className='max__size'/>
                </button>
                <button 
                  className='flex__center__y click__action h-10 min-w-10 p-1 text-customViolet rounded-sm outline-none focus:bg-zinc-100 focus:scale-105 md:h-11 md:min-w-11'
                  onClick={() => imageInputRef.current?.click()}
                >
                    <AiFillPicture className='max__size'/>
                </button>
              </motion.div>
          )}
        </AnimatePresence>
        <button type='button' className='flex__center__all click__action h-12 min-w-12 p-1 text-customViolet rounded-sm outline-none focus:bg-zinc-100 focus:scale-105 md:h-14 md:min-w-14' onClick={() => setShowMore(!showMore)}>
          <AiOutlinePlusCircle className='max__size mt-3 md:mt-4'/>
        </button>
        <input 
          type="text" 
          placeholder='Write a Message...' 
          className='input__text h-14 md:h-16 w-full rounded-xl bg-zinc-100 px-3 md:px-4 py-2 mx-1 text-sm md:text-base lg:text-lg'
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className='flex__center__y click__action h-10 min-w-10 p-1 ml-1 text-customViolet rounded-sm outline-none mt-2 focus:bg-zinc-100 focus:scale-105 md:h-14 md:min-w-14 md:mt-3'
          onClick={sendMessage}
        >
            <IoSend className='max__size'/>
        </button>
      </div>
    </div>
  )
}

export default Message