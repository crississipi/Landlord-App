"use client";

import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineDownload, AiOutlineLeft, AiOutlineRight, AiOutlineZoomIn, AiOutlineZoomOut } from 'react-icons/ai';
import { HiOutlineDocument, HiOutlineExternalLink } from 'react-icons/hi';
import { RiVideoLine, RiImageLine, RiFileLine } from 'react-icons/ri';

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
  allFiles?: UploadedFile[];
  currentIndex?: number;
  onNavigate?: (index: number) => void;
}

const ShowFileInfo = ({ showFileInfo, file, onDownload, allFiles, currentIndex = 0, onNavigate }: ShowFileInfoProps) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown size';
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileTypeLabel = (type: string) => {
    if (type.startsWith('image/')) return 'Image';
    if (type.startsWith('video/')) return 'Video';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word') || type.includes('doc')) return 'Document';
    if (type.includes('excel') || type.includes('sheet')) return 'Spreadsheet';
    if (type.includes('zip') || type.includes('rar')) return 'Archive';
    return 'File';
  };

  const getFileTypeBadgeColor = (type: string) => {
    if (type.startsWith('image/')) return 'bg-emerald-500';
    if (type.startsWith('video/')) return 'bg-rose-500';
    if (type.includes('pdf')) return 'bg-red-500';
    if (type.includes('word') || type.includes('doc')) return 'bg-blue-500';
    if (type.includes('excel') || type.includes('sheet')) return 'bg-green-500';
    if (type.includes('zip') || type.includes('rar')) return 'bg-violet-500';
    return 'bg-gray-500';
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    await onDownload(file.url, file.name);
    setIsDownloading(false);
  };

  const handlePrevious = () => {
    if (allFiles && onNavigate && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (allFiles && onNavigate && currentIndex < allFiles.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const hasNavigation = allFiles && allFiles.length > 1;

  return (
    <div 
      className='fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center' 
      onClick={() => showFileInfo(false)}
    >
      {/* Close Button */}
      <button 
        onClick={() => showFileInfo(false)}
        className='absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2 md:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200'
      >
        <AiOutlineClose className='text-xl md:text-2xl text-white' />
      </button>

      {/* Download Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); handleDownload(); }}
        disabled={isDownloading}
        className='absolute top-4 right-16 md:top-6 md:right-20 z-50 p-2 md:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200 disabled:opacity-50'
      >
        {isDownloading ? (
          <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <AiOutlineDownload className='text-xl md:text-2xl text-white' />
        )}
      </button>

      {/* Zoom Button (for images) */}
      {isImage && (
        <button 
          onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
          className='absolute top-4 right-28 md:top-6 md:right-36 z-50 p-2 md:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200'
        >
          {isZoomed ? (
            <AiOutlineZoomOut className='text-xl md:text-2xl text-white' />
          ) : (
            <AiOutlineZoomIn className='text-xl md:text-2xl text-white' />
          )}
        </button>
      )}

      {/* Navigation Arrows */}
      {hasNavigation && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
            disabled={currentIndex === 0}
            className='absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-50 p-2 md:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed'
          >
            <AiOutlineLeft className='text-2xl md:text-3xl text-white' />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            disabled={currentIndex === allFiles.length - 1}
            className='absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-50 p-2 md:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed'
          >
            <AiOutlineRight className='text-2xl md:text-3xl text-white' />
          </button>
        </>
      )}

      {/* File Counter */}
      {hasNavigation && (
        <div className='absolute top-4 left-1/2 -translate-x-1/2 md:top-6 z-50 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm md:text-base'>
          {currentIndex + 1} / {allFiles.length}
        </div>
      )}

      {/* Main Content */}
      <div 
        className='w-full h-full flex flex-col items-center justify-center p-4 md:p-8 lg:p-12'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview Area */}
        <div className={`flex-1 flex items-center justify-center w-full max-w-6xl ${isZoomed ? 'overflow-auto' : 'overflow-hidden'}`}>
          {isImage ? (
            <img 
              src={file.url} 
              alt={file.name} 
              className={`${isZoomed ? 'max-w-none cursor-zoom-out' : 'max-w-full max-h-[70vh] cursor-zoom-in'} object-contain rounded-lg shadow-2xl transition-all duration-300`}
              onClick={() => setIsZoomed(!isZoomed)}
            />
          ) : isVideo ? (
            <div className='w-full max-w-4xl'>
              <video 
                src={file.url} 
                controls 
                autoPlay
                className='w-full max-h-[70vh] rounded-lg shadow-2xl bg-black'
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className='bg-white rounded-2xl p-8 md:p-12 max-w-lg w-full shadow-2xl text-center'>
              <div className={`inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl ${getFileTypeBadgeColor(file.type)} mb-6`}>
                <RiFileLine className='text-4xl md:text-5xl text-white' />
              </div>
              <h3 className='text-xl md:text-2xl font-bold text-gray-800 mb-2 break-words'>{file.name}</h3>
              <p className='text-gray-500 mb-6'>Preview not available</p>
              
              <div className='flex flex-col gap-3'>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className='w-full py-3 bg-customViolet text-white rounded-xl hover:bg-customViolet/90 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50'
                >
                  {isDownloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <AiOutlineDownload className='text-xl' />
                      Download File
                    </>
                  )}
                </button>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className='w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium'
                >
                  <HiOutlineExternalLink className='text-xl' />
                  Open in New Tab
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Info Bar */}
        <div className='w-full max-w-4xl mt-4 md:mt-6'>
          <div className='bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-5'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
              {/* File Name & Type */}
              <div className='flex items-center gap-3 min-w-0 flex-1'>
                <div className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold text-white ${getFileTypeBadgeColor(file.type)}`}>
                  {getFileTypeLabel(file.type)}
                </div>
                <p className='text-white font-medium truncate text-sm md:text-base'>{file.name}</p>
              </div>
              
              {/* File Details */}
              <div className='flex items-center gap-4 text-white/70 text-xs md:text-sm shrink-0'>
                <span>{formatFileSize(file.size)}</span>
                <span className='hidden md:inline'>•</span>
                <span className='hidden md:inline'>{formatDate(file.uploadedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowFileInfo;
