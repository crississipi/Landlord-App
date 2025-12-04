"use client";

import React from 'react';
import { AiOutlineClose, AiOutlineDownload } from 'react-icons/ai';
import { HiOutlineDocument } from 'react-icons/hi';
import { RiVideoLine } from 'react-icons/ri';

interface UploadedFile {
  url: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  messageID: number;
  senderID: number;
}

interface ShowFileInfoProps {
  showFileInfo: (show: boolean) => void;
  file: UploadedFile;
  onDownload: (url: string, filename: string) => void;
}

const ShowFileInfo = ({ showFileInfo, file, onDownload }: ShowFileInfoProps) => {
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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  return (
    <div className='fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 md:p-6 lg:p-8' onClick={() => showFileInfo(false)}>
      <div className='bg-white rounded-xl md:rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl' onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className='flex items-center justify-between p-4 md:p-5 lg:p-6 border-b'>
          <h3 className='text-lg md:text-xl lg:text-2xl font-semibold text-customViolet truncate flex-1 mr-4'>{file.name}</h3>
          <button 
            onClick={() => showFileInfo(false)}
            className='p-2 md:p-3 hover:bg-zinc-100 rounded-full transition-colors'
          >
            <AiOutlineClose className='text-xl md:text-2xl text-zinc-600' />
          </button>
        </div>

        {/* Preview Content */}
        <div className='flex-1 overflow-y-auto bg-zinc-50 flex items-center justify-center p-4 md:p-6 lg:p-8'>
          {isImage ? (
            <img 
              src={file.url} 
              alt={file.name} 
              className='max-w-full max-h-full object-contain'
            />
          ) : isVideo ? (
            <video 
              src={file.url} 
              controls 
              className='max-w-full max-h-full'
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className='flex flex-col items-center justify-center text-center'>
              <HiOutlineDocument className='text-8xl md:text-9xl text-customViolet mb-4' />
              <p className='text-lg md:text-xl lg:text-2xl font-medium text-zinc-700'>{file.name}</p>
              <p className='text-sm md:text-base text-zinc-500 mt-2'>Preview not available for this file type</p>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className='p-4 md:p-5 lg:p-6 border-t bg-white'>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 mb-4 md:mb-5'>
            <div>
              <p className='text-sm md:text-base text-zinc-500'>File Size</p>
              <p className='font-medium md:text-lg'>{formatFileSize(file.size)}</p>
            </div>
            <div>
              <p className='text-sm md:text-base text-zinc-500'>File Type</p>
              <p className='font-medium md:text-lg'>{file.type || 'Unknown'}</p>
            </div>
            <div className='col-span-2 md:col-span-1'>
              <p className='text-sm md:text-base text-zinc-500'>Uploaded</p>
              <p className='font-medium md:text-lg'>{formatDate(file.uploadedAt)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className='flex gap-2 md:gap-3'>
            <button
              onClick={() => showFileInfo(false)}
              className='flex-1 px-4 py-2 md:py-3 border border-zinc-300 text-zinc-700 rounded-lg md:rounded-xl hover:bg-zinc-50 transition-colors md:text-lg'
            >
              Close
            </button>
            <button
              onClick={() => onDownload(file.url, file.name)}
              className='flex-1 px-4 py-2 md:py-3 bg-customViolet text-white rounded-lg md:rounded-xl hover:bg-customViolet/90 transition-colors flex items-center justify-center gap-2 md:text-lg'
            >
              <AiOutlineDownload className='text-lg md:text-xl' />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowFileInfo;
