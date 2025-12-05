import React, { useEffect, useState, useRef } from 'react'
import { AiFillFolderOpen, AiFillPicture, AiFillVideoCamera, AiOutlineInfoCircle, AiOutlineLeft, AiOutlineClose, AiOutlinePlusCircle } from 'react-icons/ai'
import { IoSend } from "react-icons/io5";
import { HiOutlineDocument } from 'react-icons/hi'
import { MessageBubble } from './customcomponents'
import { ChangePageProps, ChatInfoProps, MessageType } from '@/types'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion';
import { useClickOutside } from '@/hooks/useClickOutside';

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
  
  const clickRef = useClickOutside<HTMLDivElement>(() => setShowMore(false))

  // File preview states - now supports multiple files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ file: File; preview: string | null }[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('chatUserId changed:', chatUserId);
    if (chatUserId) {
      fetchMessages();
      fetchPartnerInfo();
    } else {
      setLoading(false);
    }
  }, [chatUserId]);

  useEffect(() => {
    if (!loading && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
  }, [messages, loading]);

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

  // Handle multiple file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setSelectedFiles(prev => [...prev, ...fileArray]);
    
    // Create previews for images and videos
    const newPreviews: { file: File; preview: string | null }[] = [];
    
    for (const file of fileArray) {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const preview = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newPreviews.push({ file, preview });
      } else {
        newPreviews.push({ file, preview: null });
      }
    }
    
    setFilePreviews(prev => [...prev, ...newPreviews]);
    setShowPreview(true);
    
    // Reset input value to allow selecting same files again
    e.target.value = '';
  };

  // Cancel file selection
  const cancelFileUpload = () => {
    setSelectedFiles([]);
    setFilePreviews([]);
    setShowPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // Remove a specific file from selection
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
    if (selectedFiles.length <= 1) {
      setShowPreview(false);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:mime/type;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Send multiple files with message
  const sendFileMessage = async () => {
    if (selectedFiles.length === 0 || !chatUserId) return;

    try {
      setUploading(true);
      
      // Convert all files to base64
      const filesData = await Promise.all(
        selectedFiles.map(async (file) => ({
          name: file.name,
          content: await fileToBase64(file),
          type: file.type,
          size: file.size
        }))
      );
      
      // Use batch upload for multiple files, single upload for one file
      const endpoint = selectedFiles.length > 1 ? '/api/messages/upload-batch' : '/api/messages/upload';
      const body = selectedFiles.length > 1 
        ? { receiverID: chatUserId, message: newMessage.trim() || null, files: filesData }
        : { receiverID: chatUserId, message: newMessage.trim() || null, file: filesData[0] };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setNewMessage('');
        cancelFileUpload();
        fetchMessages();
      } else {
        const errorData = await response.json();
        console.error('Failed to upload files:', errorData);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
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
        <div className='fixed top-0 h-full w-full flex items-center justify-center bg-gradient-to-tr from-blue-200 via-indigo-50 to-customViolet/30 opacity-30'>
          <Image
            src='/logo.png'
            alt='background'
            height={4096}
            width={4096}
            className="object-contain object-center h-40 w-40 aspect-square"
          />
        </div>
        <div className='column__align gap-3 p-4 md:p-6 lg:p-8 relative z-20 max-w-5xl mx-auto w-full'>
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

      {/* Multi-File Preview Modal */}
      {showPreview && selectedFiles.length > 0 && (
        <div className='absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-customViolet'>
                Preview Files ({selectedFiles.length})
              </h3>
              <button 
                onClick={cancelFileUpload}
                className='p-2 hover:bg-zinc-100 rounded-full transition-colors'
              >
                <AiOutlineClose className='text-xl text-zinc-600' />
              </button>
            </div>
            
            {/* Preview Content - Scrollable grid */}
            <div className='mb-4 overflow-y-auto flex-1 max-h-64'>
              <div className='grid grid-cols-2 gap-2'>
                {filePreviews.map((item, index) => (
                  <div key={index} className='relative bg-zinc-100 rounded-lg overflow-hidden aspect-square'>
                    {item.preview ? (
                      item.file.type.startsWith('video/') ? (
                        <video 
                          src={item.preview} 
                          className='w-full h-full object-cover'
                          muted
                        />
                      ) : (
                        <img 
                          src={item.preview} 
                          alt={`Preview ${index + 1}`} 
                          className='w-full h-full object-cover'
                        />
                      )
                    ) : (
                      <div className='w-full h-full flex flex-col items-center justify-center p-2'>
                        <HiOutlineDocument className='text-3xl text-customViolet mb-1' />
                        <p className='text-xs text-zinc-600 font-medium text-center truncate w-full'>{item.file.name}</p>
                      </div>
                    )}
                    {/* Remove button */}
                    <button
                      onClick={() => removeFile(index)}
                      className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors'
                    >
                      <AiOutlineClose className='text-xs' />
                    </button>
                    {/* File type badge */}
                    {item.file.type.startsWith('video/') && (
                      <div className='absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded'>
                        Video
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* File Summary */}
            <div className='bg-zinc-50 rounded-lg p-3 mb-4'>
              <p className='text-sm font-medium text-zinc-700'>
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
              </p>
              <p className='text-xs text-zinc-500 mt-1'>
                Total size: {formatFileSize(selectedFiles.reduce((acc, f) => acc + f.size, 0))}
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
                    Uploading...
                  </>
                ) : (
                  <>
                    <IoSend />
                    Send {selectedFiles.length > 1 ? `(${selectedFiles.length})` : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className='h-24 md:h-28 w-full flex items-start pl-3 pr-2 pt-2 md:px-8 lg:px-10 md:gap-3 shadow-[0px_-5px_10px_#574964] relative'>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="*/*"
          multiple
        />
        <input
          ref={imageInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*"
          multiple
        />
        <input
          ref={videoInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="video/*"
          multiple
        />
        <AnimatePresence mode='wait'>
          {showMore && (
            <motion.div 
              ref={clickRef}
              initial={{scale: 0, x: -50}}
              animate={{scale: 1, x: 0}}
              exit={{scale: 0, x: -50}}
              transition={{duration: 0.3}}
              className='absolute top-0 -mt-16 bg-white rounded-xl px-3 py-2 flex gap-1 shadow-xl z-30'>
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
                <button 
                  className='flex__center__y click__action h-10 min-w-10 p-1 text-customViolet rounded-sm outline-none focus:bg-zinc-100 focus:scale-105 md:h-11 md:min-w-11'
                  onClick={() => videoInputRef.current?.click()}
                >
                    <AiFillVideoCamera className='max__size'/>
                </button>
              </motion.div>
          )}
        </AnimatePresence>
        <button type='button' className='flex__center__all click__action h-10 min-w-10 p-1 text-customViolet rounded-sm outline-none focus:bg-zinc-100 focus:scale-105 md:h-14 md:min-w-14' onClick={() => setShowMore(!showMore)}>
          <AiOutlinePlusCircle className='max__size mt-6 md:mt-4'/>
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