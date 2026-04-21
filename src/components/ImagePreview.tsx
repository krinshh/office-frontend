'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import X from 'lucide-react/dist/esm/icons/x';
import ZoomIn from 'lucide-react/dist/esm/icons/zoom-in';
import Download from 'lucide-react/dist/esm/icons/download';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import Button from './Button';
import Image from './Image'; // Next.js Optimized Image component

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, src, alt }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent propagation for child elements to keep the click-outside logic clean
  const stopPropagation = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = alt || 'image-download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: just open in new tab if blob failed
      window.open(src, '_blank');
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-[6px] animate-fade-in sm:p-4 md:p-8 overflow-hidden"
      onClick={onClose}
    >
      {/* Control Bar - Premium Floating Glassmorphism */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 shadow-2xl z-[10000] animate-slide-up"
        onClick={stopPropagation}
      >
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent border-none text-white/70 hover:text-white px-2"
          onClick={handleDownload}
          title="Download Image"
        >
          <Download className="w-5 h-5 mr-2" />
          <span className="text-xs font-semibold hidden sm:inline">Download</span>
        </Button>
        <div className="w-px h-5 bg-white/10" />
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent border-none text-white/70 hover:text-white px-2"
          onClick={(e) => { e.stopPropagation(); window.open(src, '_blank'); }}
          title="Open in new tab"
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          <span className="text-xs font-semibold hidden sm:inline">Open Original</span>
        </Button>
        <div className="w-px h-5 bg-white/10" />
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent border-none text-white/70 hover:text-white h-10 w-10 p-0 rounded-full flex items-center justify-center transition-all"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          title="Close"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Main Image View - Sized to image content */}
      <div
        className="relative group max-w-[95vw] max-h-[85vh] flex items-center justify-center animate-scale-in"
        onClick={stopPropagation}
      >
        <div className="relative p-1 bg-white/5 border border-white/20 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <img
            src={src}
            alt={alt || 'Image Preview'}
            className="max-w-[90vw] max-h-[80vh] w-auto h-auto rounded-xl object-contain select-none"
            draggable={false}
          />
          {alt && (
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white/90 text-sm font-medium tracking-tight px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/10">{alt}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
  thumbnailClassName?: string;
  children?: React.ReactNode;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt,
  className = '',
  thumbnailClassName = '',
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className={`relative group cursor-pointer overflow-hidden ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        {children || (
          <div className="relative h-full w-full overflow-hidden">
            <img
              src={src}
              alt={alt || 'Image Preview'}
              className={`transition-all duration-500 group-hover:brightness-110 ${thumbnailClassName}`}
            />
            <div className="absolute inset-0 bg-black/0 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-2xl border border-white/30 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                <ZoomIn className="text-white w-5 h-5" />
              </div>
            </div>
          </div>
        )}
      </div>

      <ImageModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        src={src}
        alt={alt}
      />
    </>
  );
};

export default ImageModal;
