"use client";

import { MessageBubbleProps } from '@/types';
import React, { useState } from 'react';
import Image from 'next/image';
import { RiFile3Line, RiVideoLine } from 'react-icons/ri';
import { HiOutlineDocument } from 'react-icons/hi';
import MediaPreviewModal from '../MediaPreviewModal';

const MessageBubble = ({ sender, message, timestamp, files, batchId }: MessageBubbleProps) => {
  const [details, setDetails] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  
  const toggleDetails = () => {
    setDetails(!details);
  };

  const handleMediaClick = (index: number) => {
    setPreviewIndex(index);
    setShowPreview(true);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    return '📎';
  };

  const formatFileSize = (bytes: string | undefined) => {
    if (!bytes) return '';
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const hasMedia = files && files.length > 0;
  const imageFiles = files?.filter(f => f.fileType.startsWith('image/')) || [];
  const videoFiles = files?.filter(f => f.fileType.startsWith('video/')) || [];
  const documentFiles = files?.filter(f => !f.fileType.startsWith('image/') && !f.fileType.startsWith('video/')) || [];

  return (
    <>
      <div className={`column__align outline-none overflow-hidden text-customViolet text-sm pl-3 ${!sender ? 'items-start' : 'items-end'} md:text-base lg:text-lg`}>
        {details && (
          <span className='text-xs font-semibold py-1 px-3 mx-10 md:text-sm lg:text-base'>
            {formatDate(timestamp)} {formatTime(timestamp)}
          </span>
        )}
        
        <div className={`h-auto w-full flex items-end gap-2 md:gap-3 ${sender && 'flex-row-reverse'}`}>
          <div className={`max-w-[75%] md:max-w-[65%] lg:max-w-[60%] ${!sender ? 'items-start' : 'items-end'} flex flex-col gap-2 md:gap-3`}>
            {/* Text Message */}
            {message && (
              <button
                onClick={toggleDetails}
                className={`pl-4 pr-2 py-2 md:pl-5 md:pr-3 md:py-3 lg:pl-6 lg:pr-4 lg:py-4 ${!sender ? 'rounded-r-xl rounded-tl-xl bg-white text-customViolet': 'rounded-l-3xl rounded-tr-3xl bg-customViolet/90 text-white'} text-left font-light tracking-wide click__action`}
              >
                <p>{message}</p>
              </button>
            )}

            {/* Media Grid */}
            {hasMedia && (
              <div className={`flex flex-col gap-2 ${sender ? 'items-end' : 'items-start'}`}>
                {/* Images Grid */}
                {imageFiles.length > 0 && (
                  <div className={`grid gap-1 ${imageFiles.length === 1 ? 'grid-cols-1' : imageFiles.length === 2 ? 'grid-cols-2' : imageFiles.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} max-w-md`}>
                    {imageFiles.slice(0, 4).map((file, index) => (
                      <button
                        key={index}
                        onClick={() => handleMediaClick(files!.indexOf(file))}
                        className={`relative overflow-hidden rounded-lg hover:opacity-90 transition-opacity ${
                          imageFiles.length === 1 ? 'h-64' : 'h-32'
                        } ${index === 3 && imageFiles.length > 4 ? 'relative' : ''}`}
                      >
                        <Image
                          src={file.url}
                          alt={file.fileName}
                          fill
                          className="object-cover"
                        />
                        {index === 3 && imageFiles.length > 4 && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white text-2xl font-bold">
                            +{imageFiles.length - 4}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Videos */}
                {videoFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => handleMediaClick(files!.indexOf(file))}
                    className="relative w-64 h-36 rounded-lg overflow-hidden bg-black hover:opacity-90 transition-opacity"
                  >
                    <video src={file.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <RiVideoLine className="text-white text-5xl opacity-80" />
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      VIDEO
                    </div>
                  </button>
                ))}

                {/* Documents */}
                {documentFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => handleMediaClick(files!.indexOf(file))}
                    className={`flex items-center gap-3 p-3 rounded-lg hover:opacity-90 transition-opacity ${
                      !sender ? 'bg-white text-customViolet' : 'bg-customViolet/20 text-customViolet'
                    } max-w-xs`}
                  >
                    <div className="text-4xl">{getFileIcon(file.fileType)}</div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium truncate text-sm">{file.fileName}</p>
                      <p className="text-xs opacity-70">{formatFileSize(file.fileSize)}</p>
                    </div>
                    <HiOutlineDocument className="text-2xl" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {details && (
          <span className='text-xs py-1 mx-10 md:text-sm md:font-light'>
            Sent {formatTime(timestamp)}
          </span>
        )}
      </div>

      {/* Media Preview Modal */}
      {showPreview && files && (
        <MediaPreviewModal
          files={files}
          initialIndex={previewIndex}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};

export default MessageBubble;