'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AiOutlineClose, AiOutlineLeft, AiOutlineRight, AiOutlineDownload } from 'react-icons/ai';
import { RiFile3Line } from 'react-icons/ri';
import { HiOutlineDocument } from 'react-icons/hi';

interface MediaFile {
  url: string;
  fileName: string;
  fileType: string;
  fileSize?: string;
}

interface MediaPreviewModalProps {
  files: MediaFile[];
  initialIndex?: number;
  onClose: () => void;
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({ files, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentFile = files[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentFile.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentFile.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️';
    if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
    if (fileType.includes('text')) return '📃';
    return '📎';
  };

  const formatFileSize = (bytes: string | undefined) => {
    if (!bytes) return '';
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const isImage = currentFile.fileType.startsWith('image/');
  const isVideo = currentFile.fileType.startsWith('video/');
  const isDocument = !isImage && !isVideo;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-95 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 md:top-6 right-4 md:right-6 z-50 text-white hover:text-gray-300 transition-colors p-2 md:p-3 bg-black bg-opacity-50 rounded-full"
      >
        <AiOutlineClose className="text-3xl md:text-4xl" />
      </button>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="absolute top-4 md:top-6 right-20 md:right-24 z-50 text-white hover:text-gray-300 transition-colors p-2 md:p-3 bg-black bg-opacity-50 rounded-full"
      >
        <AiOutlineDownload className="text-3xl md:text-4xl" />
      </button>

      {/* Navigation Arrows (only show if multiple files) */}
      {files.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 md:left-8 z-50 text-white hover:text-gray-300 transition-colors p-3 md:p-4 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70"
          >
            <AiOutlineLeft className="text-4xl md:text-5xl" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 md:right-8 z-50 text-white hover:text-gray-300 transition-colors p-3 md:p-4 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70"
          >
            <AiOutlineRight className="text-4xl md:text-5xl" />
          </button>
        </>
      )}

      {/* File Counter */}
      {files.length > 1 && (
        <div className="absolute top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-50 text-white px-4 md:px-6 py-2 md:py-3 rounded-full text-base md:text-lg">
          {currentIndex + 1} / {files.length}
        </div>
      )}

      {/* Content */}
      <div className="w-full h-full flex items-center justify-center p-8 md:p-12 lg:p-16">
        {isImage && (
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            <Image
              src={currentFile.url}
              alt={currentFile.fileName}
              fill
              className="object-contain"
              priority
            />
          </div>
        )}

        {isVideo && (
          <div className="max-w-7xl w-full">
            <video
              src={currentFile.url}
              controls
              autoPlay
              className="w-full h-auto max-h-[80vh] rounded-lg"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {isDocument && (
          <div className="bg-white rounded-xl md:rounded-2xl p-8 md:p-10 lg:p-12 max-w-2xl w-full shadow-2xl">
            <div className="flex flex-col items-center gap-6 md:gap-8">
              <div className="text-8xl md:text-9xl">{getFileIcon(currentFile.fileType)}</div>
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-customViolet mb-2">{currentFile.fileName}</h3>
                <p className="text-gray-600 mb-1 md:text-lg">Type: {currentFile.fileType}</p>
                {currentFile.fileSize && (
                  <p className="text-gray-600 md:text-lg">Size: {formatFileSize(currentFile.fileSize)}</p>
                )}
              </div>
              
              {/* Document Preview for PDFs */}
              {currentFile.fileType === 'application/pdf' && (
                <div className="w-full h-96 border-2 border-gray-300 rounded-lg overflow-hidden">
                  <iframe
                    src={currentFile.url}
                    className="w-full h-full"
                    title={currentFile.fileName}
                  />
                </div>
              )}

              {/* Text file preview */}
              {currentFile.fileType.startsWith('text/') && (
                <div className="w-full max-h-96 overflow-auto bg-gray-100 p-4 rounded-lg">
                  <iframe
                    src={currentFile.url}
                    className="w-full h-full min-h-[300px]"
                    title={currentFile.fileName}
                  />
                </div>
              )}

              <button
                onClick={handleDownload}
                className="bg-customViolet text-white px-6 py-3 rounded-lg hover:bg-customViolet/90 transition-colors flex items-center gap-2"
              >
                <AiOutlineDownload className="text-xl" />
                Download File
              </button>
            </div>
          </div>
        )}
      </div>

      {/* File Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-lg font-semibold truncate">{currentFile.fileName}</p>
          <p className="text-sm text-gray-300">
            {currentFile.fileType} {currentFile.fileSize && `• ${formatFileSize(currentFile.fileSize)}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MediaPreviewModal;
