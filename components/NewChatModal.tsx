import React, { useState } from 'react';
import { ThemeConfig } from '../types';
import { themes } from '../themes';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (name: string, instruction: string, themeId: string) => void;
  currentTheme: ThemeConfig;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, onStart, currentTheme }) => {
  const [name, setName] = useState("");
  const [instruction, setInstruction] = useState("Você é um assistente virtual útil, conciso e elegante. Você responde em Português do Brasil.");
  const [selectedThemeId, setSelectedThemeId] = useState(currentTheme.id);

  if (!isOpen) return null;

  const handleStart = () => {
    onStart(name || "Novo Projeto", instruction, selectedThemeId);
    onClose();
    // Reset fields slightly after close for animation
    setTimeout(() => {
        setName("");
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-fade-in-up"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-light text-white tracking-wide">Novo Projeto</h2>
            <p className="text-xs text-slate-400 mt-1">Configure o ambiente e a personalidade do Lumina</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8 scrollbar-hide">
          
          {/* Section 0: Name */}
          <div className="space-y-3">
             <label className="text-sm font-medium text-indigo-300 uppercase tracking-wider">Nome do Projeto</label>
             <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Planejamento de Viagem, Estudo de React..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
             />
          </div>

          {/* Section 1: Persona */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-indigo-300 uppercase tracking-wider">Prompt do Sistema (Persona)</label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none text-sm leading-relaxed"
              placeholder="Defina como o IA deve se comportar..."
            />
          </div>

          {/* Section 2: Theme */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-indigo-300 uppercase tracking-wider">Tema Visual</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedThemeId(theme.id)}
                  className={`
                    relative group flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300
                    ${selectedThemeId === theme.id 
                      ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                    }
                  `}
                >
                  {/* Color Preview */}
                  <div className={`w-12 h-12 rounded-full shadow-lg relative overflow-hidden ${theme.colors.bg.replace('bg-', 'bg-')}`}>
                     <div className={`absolute inset-0 opacity-50 ${theme.colors.orb1}`}></div>
                  </div>
                  
                  <span className={`text-xs font-medium ${selectedThemeId === theme.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {theme.name}
                  </span>

                  {selectedThemeId === theme.id && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleStart}
            className="px-8 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-900/50 transition-all transform hover:scale-105 active:scale-95"
          >
            Iniciar Projeto
          </button>
        </div>

      </div>
    </div>
  );
};

export default NewChatModal;