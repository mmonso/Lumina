import React from 'react';
import { ThemeConfig } from '../types';

interface DashboardProps {
  onNewChat: () => void;
  onContinue: () => void;
  activeChatName: string | null;
  theme: ThemeConfig;
}

const Dashboard: React.FC<DashboardProps> = ({ onNewChat, onContinue, activeChatName, theme }) => {
  const textColor = theme.isDark ? 'text-white' : 'text-slate-800';
  const subTextColor = theme.isDark ? 'text-white/50' : 'text-slate-500';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in-up">
      <div className="max-w-2xl w-full text-center space-y-12">
        
        {/* Logo / Brand Area */}
        <div className="space-y-4">
          <div className="relative inline-block">
             <div className={`absolute -inset-4 rounded-full blur-3xl opacity-20 bg-${theme.colors.accent}-500 animate-pulse`}></div>
             <h1 className={`relative text-6xl md:text-8xl font-thin tracking-[0.2em] ${textColor} drop-shadow-2xl`}>
                LUMINA
             </h1>
          </div>
          <p className={`text-sm md:text-base tracking-[0.3em] uppercase opacity-70 ${textColor}`}>
            Inteligência Artificial & Design Fluido
          </p>
        </div>

        {/* Action Area */}
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
          
          {/* New Chat Button (Primary Action) */}
          <button
            onClick={onNewChat}
            className={`
              w-full group relative px-8 py-4 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]
              border shadow-2xl hover:shadow-${theme.colors.accent}-500/20
              ${theme.isDark 
                 ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                 : 'bg-white/40 border-white/40 hover:bg-white/60'
              }
            `}
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-${theme.colors.accent}-500 to-purple-500 transition-opacity`}></div>
            <div className="flex items-center justify-center gap-4">
              <span className={`p-2 rounded-lg bg-${theme.colors.accent}-500/20 text-${theme.colors.accent}-500 group-hover:text-white group-hover:bg-${theme.colors.accent}-500 transition-colors`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </span>
              <span className={`text-lg font-light tracking-wide ${textColor}`}>
                  Nova Conversa
              </span>
            </div>
          </button>

          {/* Continue Button (If chat exists) */}
          {activeChatName && (
             <div className="w-full animate-fade-in-up delay-100 flex flex-col gap-2">
                 <div className={`text-[10px] uppercase tracking-widest pl-2 opacity-60 text-left ${textColor}`}>Em andamento</div>
                 <button
                    onClick={onContinue}
                    className={`
                      w-full group relative px-8 py-4 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]
                      backdrop-blur-xl border shadow-xl flex items-center justify-between
                      ${theme.isDark 
                        ? 'bg-white/10 border-white/20 hover:bg-white/15' 
                        : 'bg-white/60 border-black/5 hover:bg-white/80'
                      }
                    `}
                  >
                     <div className="flex flex-col items-start">
                         <span className={`text-lg font-light truncate max-w-[200px] sm:max-w-xs ${textColor}`}>{activeChatName}</span>
                         <span className={`text-[10px] uppercase tracking-wider opacity-60 ${textColor}`}>Continuar anterior</span>
                     </div>
                     <div className={`p-2 rounded-full ${theme.isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${textColor}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                     </div>
                 </button>
             </div>
          )}
          
          {!activeChatName && (
             <p className={`text-xs ${subTextColor} font-light italic text-center leading-relaxed mt-2`}>
               "Configure sua persona, escolha seu tema e inicie uma nova jornada."
             </p>
          )}
        </div>

        {/* Footer Features */}
        <div className={`grid grid-cols-3 gap-4 pt-12 border-t w-full ${theme.isDark ? 'border-white/5' : 'border-black/5'}`}>
            <FeatureItem icon="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" label="Gemini 2.5" theme={theme} />
            <FeatureItem icon="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" label="Multimodal" theme={theme} />
            <FeatureItem icon="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.546-3.131 1.567-4.382m15.686 0A17.931 17.931 0 0121 12m-1.566 4.383A8.969 8.969 0 0112 16.5V21" label="Web Search" theme={theme} />
        </div>

      </div>
    </div>
  );
};

const FeatureItem: React.FC<{ icon: string, label: string, theme: ThemeConfig }> = ({ icon, label, theme }) => (
    <div className={`flex flex-col items-center gap-2 opacity-50 ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </div>
);

export default Dashboard;