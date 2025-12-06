import React, { useState, useRef, useEffect } from 'react';
import { ThemeConfig } from '../types';

interface AudioPlayerProps {
  src: string;
  theme: ThemeConfig;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, theme }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const bar = e.currentTarget;
      const rect = bar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const newTime = (clickX / width) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress((newTime / audioRef.current.duration) * 100);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-xl border w-full max-w-sm transition-all
      ${theme.isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}
    `}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />

      <button
        onClick={togglePlay}
        className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105
          bg-${theme.colors.accent}-500 text-white shadow-lg
        `}
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 ml-0.5">
            <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
        )}
      </button>

      <div className="flex-1 flex flex-col justify-center gap-1">
        <div 
          className="relative h-1.5 bg-gray-500/20 rounded-full cursor-pointer overflow-hidden"
          onClick={handleSeek}
        >
          <div 
            className={`absolute top-0 left-0 h-full rounded-full bg-${theme.colors.accent}-500 transition-all duration-100`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className={`flex justify-between text-[10px] font-mono opacity-60 ${theme.isDark ? 'text-white' : 'text-black'}`}>
          <span>{audioRef.current ? formatTime(audioRef.current.currentTime) : "0:00"}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;