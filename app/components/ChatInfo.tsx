'use client';

import { ChangePageProps, ChatInfoProps } from '@/types'
import React, { useEffect, useState } from 'react'
import { AiOutlineLeft, AiOutlineSearch } from 'react-icons/ai'
import { RiImageFill, RiFile3Line, RiVideoLine } from 'react-icons/ri'
import { CustomNavBtn } from './customcomponents'
import ShowFileInfo from './ShowFileInfo'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

type ChatProps = ChatInfoProps & ChangePageProps & {
  chatUserId?: number;
};

interface TenantProfile {
  userID: number;
  firstName: string;
  lastName: string;
  email: string;
  isOnline: boolean;
  role: string;
  profileImage?: string | null;
}

interface Message {
  messageID: number;
  senderID: number;
  receiverID: number;
  message: string | null;
  dateSent: string;
  read: boolean;
  sender?: {
    userID: number;
    firstName: string;
    lastName: string;
    role: string;
  };
  fileUrl?: string;
  fileName?: string;
  fileType?: string | null;
  fileSize?: string | null;
  files?: {
    url: string;
    fileName: string;
    fileType: string | null;
    fileSize?: string | null;
  }[];
  batchId?: string | null;
}

interface UploadedFile {
  url: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  messageID: number;
  senderID: number;
}

const ChatInfo: React.FC<ChatProps> = ({ setPage, chatInfo, setChatInfo, chatUserId }) => {
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  
  // File management state
  const [fileInfo, showFileInfo] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [option, setOption] = useState<'images' | 'videos' | 'files'>('images');
  const [allFiles, setAllFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (chatUserId && chatInfo === "right-0") {
      fetchTenantProfile();
      fetchAllFiles();
    }
  }, [chatUserId, chatInfo, fetchTenantProfile, fetchAllFiles]);

  const fetchTenantProfile = async () => {
    if (!chatUserId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${chatUserId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching tenant profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeChatInfo = () => {
    setChatInfo("-right-[9999px]");
  }
  
  const changePage = (page: number, userId?: number) => {
    setTimeout(() => {
      setPage(page, userId || chatUserId);
      setChatInfo("-right-[9999px]");
    }, 100);
  }

  // Get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Fetch all files from messages
  const fetchAllFiles = async () => {
    if (!chatUserId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/messages/${chatUserId}?all=true`);
      
      if (response.ok) {
        const data = await response.json();
        const messages: Message[] = Array.isArray(data) ? data : (data.messages || []);
        
        // Extract files from messages - handle both old format (fileUrl) and new format (files array)
        const files: UploadedFile[] = [];
        
        messages.forEach(message => {
          // Handle new format with files array
          if (message.files && message.files.length > 0) {
            message.files.forEach(file => {
              files.push({
                url: file.url,
                name: file.fileName,
                type: file.fileType || 'application/octet-stream',
                size: parseInt(file.fileSize || '0') || 0,
                uploadedAt: message.dateSent,
                messageID: message.messageID,
                senderID: message.senderID
              });
            });
          }
          // Handle old format with fileUrl
          else if (message.fileUrl && message.fileName) {
            files.push({
              url: message.fileUrl,
              name: message.fileName,
              type: message.fileType || 'application/octet-stream',
              size: parseInt(message.fileSize || '0') || 0,
              uploadedAt: message.dateSent,
              messageID: message.messageID,
              senderID: message.senderID
            });
          }
        });

        // Reverse to show newest first
        setAllFiles(files.reverse());
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileClick = (file: UploadedFile, index: number) => {
    setSelectedFile(file);
    setSelectedFileIndex(index);
    showFileInfo(true);
  };

  const handleNavigate = (index: number) => {
    const newFile = filteredFiles[index];
    if (newFile) {
      setSelectedFile(newFile);
      setSelectedFileIndex(index);
    }
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return { label: 'IMG', color: 'bg-emerald-500' };
    if (fileType.startsWith('video/')) return { label: 'VID', color: 'bg-rose-500' };
    if (fileType.startsWith('audio/')) return { label: 'AUD', color: 'bg-amber-500' };
    if (fileType.includes('pdf')) return { label: 'PDF', color: 'bg-red-500' };
    if (fileType.includes('word') || fileType.includes('document') || fileType.includes('doc')) return { label: 'DOC', color: 'bg-blue-500' };
    if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileType.includes('sheet')) return { label: 'XLS', color: 'bg-green-500' };
    if (fileType.includes('zip') || fileType.includes('compressed') || fileType.includes('rar')) return { label: 'ZIP', color: 'bg-violet-500' };
    return { label: 'FILE', color: 'bg-gray-500' };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOwnFile = (file: UploadedFile) => {
    return session?.user?.id && file.senderID === parseInt(session.user.id);
  };

  // Filter files based on selected option
  const imageFiles = allFiles.filter(file => file.type.startsWith('image/'));
  const videoFiles = allFiles.filter(file => file.type.startsWith('video/'));
  const documentFiles = allFiles.filter(file => 
    !file.type.startsWith('image/') && 
    !file.type.startsWith('video/') && 
    !file.type.startsWith('audio/')
  );

  const filteredFiles = option === 'images' ? imageFiles : 
                        option === 'videos' ? videoFiles : 
                        documentFiles;

  const currentConversation = profile ? {
    partner: {
      userID: profile.userID,
      name: `${profile.firstName} ${profile.lastName}`,
      isOnline: profile.isOnline,
      role: profile.role
    }
  } : null;

  return (
    <div className={`h-full w-full md:w-96 lg:w-[28rem] xl:w-[32rem] bg-white absolute top-0 ${chatInfo} ease-out duration-300 z-50 overflow-y-auto shadow-2xl`}>
      <div className='h-auto w-full flex flex-col gap-5 px-5 py-3 md:px-6 lg:px-8'>
          <div className='h-auto w-full flex__center__y gap-3'>
              <button className='rounded-sm h-11 w-11 p-1 focus:ring-2 focus:ring-customViolet/50 focus:scale-105 outline-none' onClick={closeChatInfo}>
                  <AiOutlineLeft className='max__size text-emerald-700'/>
              </button>
          </div>
          
          {loading ? (
            <div className='flex justify-center py-12'>
              <div className="w-8 h-8 border-3 border-customViolet border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className='column__align gap-1 flex__center__y'>
                  <div className='flex__center__all h-auto w-full py-2 md:py-4'>
                      <button type='button' onClick={() => changePage(7, chatUserId)} className='outline-none rounded-full bg-gradient-to-br from-indigo-500 to-customViolet h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 text-white flex items-center justify-center text-3xl md:text-4xl lg:text-5xl font-bold relative overflow-hidden hover:scale-105 transition-transform'>
                        {profile?.profileImage ? (
                          <Image 
                            src={profile.profileImage} 
                            alt={`${profile.firstName} ${profile.lastName}`}
                            fill
                            className="object-cover object-top"
                          />
                        ) : (
                          profile ? getInitials(profile.firstName, profile.lastName) : 'T'
                        )}
                      </button>
                  </div>
                  <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold'>
                    {profile ? `${profile.firstName} ${profile.lastName}` : 'Loading...'}
                  </h2>
                  <p className='text-sm md:text-base text-zinc-500'>{profile?.email || ''}</p>
              </div>
              <div className='max__size flex flex-col items-center pb-5 my-5'>
                  <div className='max__size flex flex-col gap-3 md:gap-5'>              
                            {/* Stats Bar */}
                            <div className='w-full flex items-center justify-around py-2 md:py-3 border-b'>
                              <div className='text-center'>
                                <div className='text-xl md:text-2xl lg:text-3xl font-bold text-customViolet'>{imageFiles.length}</div>
                                <div className='text-xs md:text-sm text-gray-600'>Images</div>
                              </div>
                              <div className='text-center'>
                                <div className='text-xl md:text-2xl lg:text-3xl font-bold text-customViolet'>{videoFiles.length}</div>
                                <div className='text-xs md:text-sm text-gray-600'>Videos</div>
                              </div>
                              <div className='text-center'>
                                <div className='text-xl md:text-2xl lg:text-3xl font-bold text-customViolet'>{documentFiles.length}</div>
                                <div className='text-xs md:text-sm text-gray-600'>Files</div>
                              </div>
                            </div>
                      
                            {/* Options Tabs */}
                            <div className='w-full flex items-center'>
                              <button 
                                type="button" 
                                className={`flex gap-2 items-center rounded-full py-3 px-5 ease-out duration-200 flex-1 justify-center ${
                                  option === 'images' 
                                    ? 'bg-customViolet text-white' 
                                    : 'hover:bg-customViolet/50 focus:bg-customViolet focus:text-white'
                                }`}
                                onClick={() => setOption('images')}
                              >
                                <RiImageFill className='text-xl'/>
                                <span className='text-sm'>Images</span>
                              </button>
                              <button 
                                type="button" 
                                className={`flex gap-2 items-center rounded-full py-3 px-5 ease-out duration-200 flex-1 justify-center ${
                                  option === 'videos' 
                                    ? 'bg-customViolet text-white' 
                                    : 'hover:bg-customViolet/50 focus:bg-customViolet focus:text-white'
                                }`}
                                onClick={() => setOption('videos')}
                              >
                                <RiVideoLine className='text-xl'/>
                                <span>Videos</span>
                              </button>
                              <button 
                                type="button" 
                                className={`flex gap-2 items-center rounded-full py-3 px-5 ease-out duration-200 flex-1 justify-center ${
                                  option === 'files' 
                                    ? 'bg-customViolet text-white' 
                                    : 'hover:bg-customViolet/50 focus:bg-customViolet focus:text-white'
                                }`}
                                onClick={() => setOption('files')}
                              >
                                <RiFile3Line className='text-xl'/>
                                <span>Files</span>
                              </button>
                            </div>
                      
                            {/* Files/Media Content */}
                            <div className='h-full w-full overflow-x-hidden flex flex-col'>
                              {isLoading ? (
                                <div className='flex items-center justify-center h-full'>
                                  <div className='text-gray-500'>Loading files...</div>
                                </div>
                              ) : filteredFiles.length === 0 ? (
                                <div className='flex items-center justify-center h-full'>
                                  <div className='text-center text-gray-500'>
                                    <div className='text-6xl mb-4'>📁</div>
                                    <p>No {option} found</p>
                                    <p className='text-sm'>Shared {option} will appear here</p>
                                  </div>
                                </div>
                              ) : option === 'files' ? (
                                <div className='w-full flex flex-col gap-2 p-3 overflow-y-auto'>
                                  {filteredFiles.map((file, i) => (
                                    <button 
                                      key={`file-${file.messageID}-${i}`}
                                      type='button' 
                                      className='w-full p-3 bg-neutral-100 rounded-xl flex gap-3 items-center hover:bg-neutral-200 focus:bg-neutral-200 ease-out duration-200' 
                                      onClick={() => handleFileClick(file, i)}
                                    >
                                      <span className={`h-10 px-2 rounded-lg flex items-center justify-center text-xs font-bold text-white ${getFileIcon(file.type).color}`}>
                                        {getFileIcon(file.type).label}
                                      </span>
                                      <div className='flex-1 text-left min-w-0'>
                                        <h3 className='font-medium truncate text-sm' title={file.name}>{file.name}</h3>
                                        <div className='flex items-center gap-1.5 text-xs text-gray-500 mt-0.5'>
                                          <span>{formatFileSize(file.size)}</span>
                                          <span>•</span>
                                          <span>{formatDate(file.uploadedAt)}</span>
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className='w-full h-auto grid grid-cols-3 gap-1.5 p-3 overflow-y-auto'>
                                  {filteredFiles.map((file, i) => (
                                    <button 
                                      key={`media-${file.messageID}-${i}`}
                                      className='aspect-square col-span-1 rounded-lg overflow-hidden relative group hover:scale-[1.02] focus:scale-[1.02] transition-transform duration-200 shadow-sm'
                                      onClick={() => handleFileClick(file, i)}
                                    >
                                      {file.type.startsWith('image/') ? (
                                        <img 
                                          src={file.url} 
                                          alt={file.name}
                                          className="w-full h-full object-cover"
                                          loading="lazy"
                                        />
                                      ) : file.type.startsWith('video/') ? (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                                          <video className="w-full h-full object-cover opacity-60">
                                            <source src={file.url} type={file.type} />
                                          </video>
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                                              <RiVideoLine className="text-2xl text-white" />
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-customViolet to-indigo-600">
                                          <span className="text-2xl text-white">🎵</span>
                                        </div>
                                      )}
                                      
                                      {/* Hover overlay */}
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
                                      
                                      {/* File type badge */}
                                      <div className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm text-white text-[9px] font-medium px-1.5 py-0.5 rounded">
                                        {file.type.startsWith('image/') ? 'IMG' : 
                                         file.type.startsWith('video/') ? 'VID' : 'AUD'}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                      
                  </div>
              </div>
            </>
          )}
      
          {/* File Info Modal */}
          {fileInfo && selectedFile && (
            <ShowFileInfo 
              showFileInfo={showFileInfo}
              file={selectedFile}
              onDownload={downloadFile}
              allFiles={filteredFiles}
              currentIndex={selectedFileIndex}
              onNavigate={handleNavigate}
            />
          )}
      </div>
    </div>
  )
}

export default ChatInfo
