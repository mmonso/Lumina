import React, { useState, useEffect } from 'react';
import { ThemeConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInstruction: string;
  onSave: (newInstruction: string) => void;
  theme: ThemeConfig;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentInstruction, onSave, theme }) => {
  const [instruction, setInstruction] = useState(currentInstruction);

  // Reset local state when modal opens with new props
  useEffect(() => {
    setInstruction(currentInstruction);
  }, [currentInstruction, isOpen]);

  if (!isOpen) return null;

  const textColor = theme.isDark ? 'text-white' : 'text-slate-800';
  const mutedColor = theme.isDark ? 'text-white/50' : 'text-slate-500';
  const inputBg = theme.isDark ? 'bg-white/5 border-white/10 focus:border-white/30' : 'bg-black/5 border-black/5 focus:border-black/10';
  const glassBg = theme.isDark ? 'bg-black/60 border-white/10' : 'bg-white/80 border-black/5';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className={`relative w-full max-w-lg transform overflow-hidden rounded-2xl backdrop-blur-2xl border shadow-2xl transition-all animate-fade-in-up ${glassBg}`}>
        <div className="p-8">
          
          {/* Header Minimalista */}
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-1">
                <h3 className={`text-2xl font-thin tracking-wide ${textColor}`}>Persona</h3>
                <p className={`text-xs uppercase tracking-widest ${mutedColor}`}>
                    Comportamento do Modelo
                </p>
            </div>
            <button 
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${theme.isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className={`w-full h-48 rounded-xl p-4 text-sm leading-relaxed resize-none transition-all outline-none border font-light ${inputBg} ${textColor} placeholder-${mutedColor}`}
            placeholder="Defina como o Lumina deve se comportar..."
          />

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={onClose}
              className={`px-4 py-2 text-sm transition-opacity hover:opacity-100 opacity-60 ${textColor}`}
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onSave(instruction);
                onClose();
              }}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg ${theme.isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/80 hover:bg-black/70 text-white'}`}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;