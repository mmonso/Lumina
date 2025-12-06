import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInstruction: string;
  onSave: (newInstruction: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentInstruction, onSave }) => {
  const [instruction, setInstruction] = useState(currentInstruction);

  // Reset local state when modal opens with new props
  useEffect(() => {
    setInstruction(currentInstruction);
  }, [currentInstruction, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl transition-all animate-fade-in-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-light text-white tracking-wide">Persona do Modelo</h3>
            <button 
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-sm text-slate-400 mb-4 font-light">
            Defina como o Lumina deve se comportar durante a conversa.
          </p>

          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="w-full h-40 bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none text-sm leading-relaxed scrollbar-hide"
            placeholder="Digite as instruções do sistema..."
          />

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onSave(instruction);
                onClose();
              }}
              className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all transform hover:scale-105"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;