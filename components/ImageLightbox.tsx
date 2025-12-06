import React, { useEffect, useState } from 'react';

interface ImageLightboxProps {
  src: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, isOpen, onClose }) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Small delay to allow render before opacity transition
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      ></div>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-[102]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Image */}
      <img 
        src={src} 
        alt="Full view" 
        className={`max-w-[95vw] max-h-[95vh] rounded-lg shadow-2xl object-contain z-[101] transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-90'}`}
        onClick={(e) => e.stopPropagation()} 
      />
    </div>
  );
};

export default ImageLightbox;