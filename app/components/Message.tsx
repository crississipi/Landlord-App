import React, { useEffect, useState, useRef, useCallback } from 'react'

import { AiFillFolderOpen, AiFillPicture, AiOutlineInfoCircle, AiOutlineLeft, AiOutlineClose, AiOutlinePlusCircle, AiFillVideoCamera } from 'react-icons/ai'
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

const MESSAGES_PAGE_SIZE = 10;

const Message: React.FC<ChatProps> = ({ setPage, setChatInfo, chatUserId }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<number | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagePreview, setNewMessagePreview] = useState<{ id: number; text: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);

  const clickRef = useClickOutside<HTMLDivElement>(() => setShowMore(false))

  // File preview states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = useCallback(async ({
    cursor: cursorParam,
    prepend = false,
    isInitial = false,
  }: {
    cursor?: number | null;
    prepend?: boolean;
    isInitial?: boolean;
  } = {}) => {
    if (!chatUserId) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (isInitial) {
        setLoading(true);
      } else if (prepend) {
        setLoadingMore(true);
      }

      if (prepend) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      const params = new URLSearchParams();
      params.set('limit', MESSAGES_PAGE_SIZE.toString());
      if (cursorParam) {
        params.set('cursor', String(cursorParam));
      }

      console.log('Fetching messages for user:', chatUserId, 'params:', params.toString());
      const response = await fetch(`/api/messages/${chatUserId}?${params.toString()}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched messages:', data);

        setHasMore(data.hasMore);
        setCursor(data.nextCursor);

        const container = scrollContainerRef.current;
        const prevScrollHeight = container ? container.scrollHeight : 0;

        setMessages((prev) => {
          const prevLastId = prev.length ? prev[prev.length - 1].messageID : null;
          const nextMessages = prepend ? [...data.messages, ...prev] : data.messages;

          if (!prepend && !isInitial && !isAtBottom && nextMessages.length) {
            const last = nextMessages[nextMessages.length - 1];
            if (last.messageID !== prevLastId && last.senderID === chatUserId) {
              let previewText = (last.message || '').trim();

              if (!previewText) {
                const firstFile = last.files && last.files[0];
                if (firstFile?.fileType?.startsWith('image/')) {
                  previewText = 'Sent a photo';
                } else if (firstFile?.fileType?.startsWith('video/')) {
                  previewText = 'Sent a video';
                } else if (firstFile) {
                  previewText = 'Sent a file';
                } else {
                  previewText = 'New message';
                }
              }

              const trimmed = previewText.length > 80 ? `${previewText.slice(0, 80)}…` : previewText;
              setNewMessagePreview({ id: last.messageID, text: trimmed });
            }
          }

          return nextMessages;
        });

        if (isInitial) {
          setTimeout(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
              setIsAtBottom(true);
            }
          }, 100);
        } else if (prepend && container) {
          setTimeout(() => {
            if (!scrollContainerRef.current) return;
            const newScrollHeight = scrollContainerRef.current.scrollHeight;
            scrollContainerRef.current.scrollTop = newScrollHeight - prevScrollHeight;
          }, 50);
        }
      } else {
        console.error('Failed to fetch messages:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      isFetchingRef.current = false;
      if (isInitial) {
        setLoading(false);
      }
      if (prepend) {
        setLoadingMore(false);
      }
    }
  }, [chatUserId, isAtBottom]);

  const fetchPartnerInfo = useCallback(async () => {
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
  }, [chatUserId]);

  useEffect(() => {
    console.log('chatUserId changed:', chatUserId);
    if (chatUserId) {
      setMessages([]);
      setCursor(null);
      setHasMore(true);
      fetchMessages({ isInitial: true });
      fetchPartnerInfo();
    } else {
      setLoading(false);
    }
  }, [chatUserId, fetchMessages, fetchPartnerInfo]);

  // Background polling for new messages
  useEffect(() => {
    if (!chatUserId) return;

    const pollInterval = setInterval(async () => {
      if (isFetchingRef.current) return;
      
      try {
        const params = new URLSearchParams();
        params.set('limit', '1');
        
        const response = await fetch(`/api/messages/${chatUserId}?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            const latestMessage = data.messages[data.messages.length - 1];
            
            // Check if this is a new message we don't have yet
            setMessages(prev => {
              const messageExists = prev.some(msg => msg.messageID === latestMessage.messageID);
              if (messageExists) return prev;
              
              // New message detected - add it and show preview if not at bottom
              const updatedMessages = [...prev, latestMessage];
              
              if (!isAtBottom && latestMessage.senderID === chatUserId) {
                let previewText = (latestMessage.message || '').trim();
                if (!previewText) {
                  const firstFile = latestMessage.files && latestMessage.files[0];
                  if (firstFile?.fileType?.startsWith('image/')) {
                    previewText = 'Sent a photo';
                  } else if (firstFile?.fileType?.startsWith('video/')) {
                    previewText = 'Sent a video';
                  } else if (firstFile) {
                    previewText = 'Sent a file';
                  } else {
                    previewText = 'New message';
                  }
                }
                const trimmed = previewText.length > 80 ? `${previewText.slice(0, 80)}…` : previewText;
                setNewMessagePreview({ id: latestMessage.messageID, text: trimmed });
              } else if (isAtBottom) {
                // Auto-scroll to bottom for new messages when already at bottom
                setTimeout(() => {
                  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }, 100);
              }
              
              return updatedMessages;
            });
          }
        }
      } catch (error) {
        console.error('Background polling error:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [chatUserId, isAtBottom]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const atBottomNow = distanceFromBottom <= 40;
    setIsAtBottom(atBottomNow);
    if (atBottomNow) {
      setNewMessagePreview(null);
    }

    if (loading || loadingMore || !hasMore || !cursor) return;
    if (container.scrollTop <= 50) {
      fetchMessages({ cursor, prepend: true });
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
        await fetchMessages({ isInitial: true });
        // Ensure scroll to bottom after sending
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 150);
      } else {
        console.error('Failed to send message:', response.status);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
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

  const cancelFileUpload = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setShowPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

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
        await fetchMessages({ isInitial: true });
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 150);
      } else {
        console.error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

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

  const onViewBilling = (billingId: number) => {
    // Assuming billing page is 6, with billingId as second param if needed
    setPage(6, billingId);
  };

  const onViewMaintenance = (maintenanceId: number) => {
    // Maintenance documentation page is 4
    setPage(4, maintenanceId);
  };

  return (
    <div className='h-screen w-full lg:h-[90vh] flex flex-col text-customViolet bg-white rounded-t-2xl lg:rounded-none relative overflow-hidden'>
      <div className='pointer-events-none absolute inset-0 flex items-center justify-center bg-linear-to-tr from-blue-200 via-indigo-50 to-customViolet/30 opacity-30 -z-10'>
        <Image
          src='/logo.png'
          alt='background'
          height={4096}
          width={4096}
          className="object-cover object-center max-h-60 max-w-60 aspect-square h-full w-full"
        />
      </div>

      {/* Header */}
      <div className='h-20 md:h-24 lg:h-16 w-full bg-white shadow-sm shadow-zinc-100 flex items-center px-5 md:px-8 lg:px-5 lg:gap-0 gap-3 md:gap-4 shrink-0 z-20'>
        <button className='focus__action hover__action click__action rounded-sm h-9 w-9 p-1 outline-none' onClick={() => changePage(2)}>
         <AiOutlineLeft className='max__size text-emerald-700'/>
        </button>
        <div className='flex__center__y gap-3 md:gap-4'>
            <div className='h-11 min-w-11 rounded-full bg-customViolet relative md:h-14 md:min-w-14 lg:h-12 lg:min-w-12 font-bold text-white text-base md:text-lg flex items-center justify-center overflow-hidden'>
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
            <p className='column__align text-base font-medium lg:text-sm'>
            {partner ? `${partner.firstName} ${partner.lastName}` : 'Loading...'}
            <span className='text-xs font-normal md:text-sm lg:text-xs'>
              {partner?.isOnline ? 'Active Now' : 'Offline'}
            </span>
            </p>
        </div>
        <button className='focus__action hover__action click__action ml-auto h-7 min-w-7 text-emerald-700 rounded-full outline-none z-50' onClick={showChatInfo}>
            <AiOutlineInfoCircle className='max__size'/>
        </button>
      </div>

      {/* Messages - Scrollable area */}
      <div
        className='flex-1 w-full overflow-x-hidden overflow-y-auto relative'
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <div className='column__align gap-5 p-4 md:p-6 lg:p-5 z-50 w-full max-w-4xl lg:max-w-full mx-auto'>
          {!loading && !hasMore && messages.length > 0 && (
            <div className='w-full flex justify-center py-1'>
              <span className='text-xs md:text-sm text-zinc-500 bg-white/70 px-3 py-1 rounded-full shadow-sm'>
                You're all caught up
              </span>
            </div>
          )}
          {loading && (
            <div className='w-full flex justify-center py-4'>
              <div className='w-6 h-6 border-2 border-customViolet border-t-transparent rounded-full animate-spin' />
            </div>
          )}
          {!loading && loadingMore && (
            <div className='w-full flex justify-center py-2'>
              <div className='w-5 h-5 border-2 border-customViolet border-t-transparent rounded-full animate-spin' />
            </div>
          )}
          {!loading && messages.map((message) => (
            <MessageBubble 
              key={message.messageID}
              sender={message.senderID !== chatUserId}
              message={message.message}
              timestamp={message.dateSent}
              files={message.files}
              batchId={message.batchId}
              onViewBilling={onViewBilling}
              onViewMaintenance={onViewMaintenance}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {newMessagePreview && !isAtBottom && (
          <div className='absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none'>
            <button
              type='button'
              className='pointer-events-auto bg-customViolet text-white text-xs md:text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-customViolet/90'
              onClick={() => {
                if (messagesEndRef.current) {
                  messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
                setIsAtBottom(true);
                setNewMessagePreview(null);
              }}
            >
              <span className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse' />
              <span className='font-medium'>New message</span>
              <span className='max-w-[180px] truncate'>{newMessagePreview.text}</span>
            </button>
          </div>
        )}
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

      {/* Input - Fixed at bottom */}
      <div className='h-24 md:h-28 lg:h-20 w-full flex items-start lg:items-center pl-3 pr-2 pt-2 md:px-8 lg:px-5 md:gap-3 shadow-[0px_-5px_10px_#574964] relative z-20 shrink-0 bg-white'>
        <div className='w-full max-w-4xl lg:max-w-full mx-auto lg:mx-0 flex items-start lg:items-center gap-0 md:gap-3'>
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
          <input
            ref={videoInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="video/*"
          />
          <AnimatePresence mode='wait'>
            {showMore && (
              <motion.div 
                ref={clickRef}
                initial={{scale: 0, x: -50}}
                animate={{scale: 1, x: 0}}
                exit={{scale: 0, x: -50}}
                transition={{duration: 0.3}}
                className='absolute lg:hidden top-0 -mt-16 bg-white rounded-xl px-3 py-2 flex gap-1 shadow-xl z-999'>
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
          <div className='w-max flex items-center'>
            <button 
                    className='flex__center__y click__action h-10 min-w-10 p-1 text-customViolet rounded-sm outline-none focus:bg-zinc-100 focus:scale-105 md:h-11 md:min-w-11 lg:h-9 lg:min-w-9'
                    onClick={() => fileInputRef.current?.click()}
                  >
                      <AiFillFolderOpen className='max__size'/>
                  </button>
                  <button 
                    className='flex__center__y click__action h-10 min-w-10 p-1 text-customViolet rounded-sm outline-none focus:bg-zinc-100 focus:scale-105 md:h-11 md:min-w-11 lg:h-9 lg:min-w-9'
                    onClick={() => imageInputRef.current?.click()}
                  >
                      <AiFillPicture className='max__size'/>
                  </button>
                  <button 
                    className='flex__center__y click__action h-10 min-w-10 p-1 text-customViolet rounded-sm outline-none focus:bg-zinc-100 focus:scale-105 md:h-11 md:min-w-11 lg:h-9 lg:min-w-9'
                    onClick={() => videoInputRef.current?.click()}
                  >
                      <AiFillVideoCamera className='max__size'/>
                  </button>
          </div>
          <button type='button' className='flex__center__all lg:hidden click__action h-12 min-w-12 p-1 text-customViolet rounded-sm outline-none focus:bg-zinc-100 focus:scale-105 md:h-14 md:min-w-14' onClick={() => setShowMore(!showMore)}>
            <AiOutlinePlusCircle className='max__size mt-3 md:mt-4'/>
          </button>
          <input 
            type="text" 
            placeholder='Write a Message...' 
            className='input__text h-14 md:h-16 lg:h-14 w-full rounded-xl bg-zinc-100 px-3 md:px-4 py-2 mx-1 text-sm md:text-base lg:text-sm lg:rounded-sm'
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className='flex__center__y click__action h-10 min-w-10 p-1 ml-1 text-customViolet rounded-sm outline-none mt-2 focus:bg-zinc-100 focus:scale-105 md:h-14 md:min-w-14 lg:min-w-9 lg:h-9 lg:mt-0 md:mt-3'
            onClick={sendMessage}
          >
              <IoSend className='max__size'/>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Message