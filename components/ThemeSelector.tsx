import React from 'react';
import { ThemeConfig } from '../types';
import { themes } from '../themes';

interface ThemeSelectorProps {
  currentTheme: ThemeConfig;
  onSelect: (themeId: string) => void;
  onClose: () => void;
  align?: 'left' | 'right' | 'center';
  direction?: 'up' | 'down';
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  currentTheme, 
  onSelect, 
  onClose, 
  align = 'right',
  direction = 'down'
}) => {
  let alignmentClass = '';
  switch (align) {
    case 'left': alignmentClass = 'left-0'; break;
    case 'center': alignmentClass = 'left-1/2 -translate-x-1/2'; break;
    case 'right': default: alignmentClass = 'right-0'; break;
  }

  const verticalClass = direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2';

  return (
    <div className={`absolute ${alignmentClass} ${verticalClass} w-56 rounded-xl overflow-hidden backdrop-blur-xl border shadow-2xl z-50 animate-fade-in-up origin-bottom`}
         style={{ 
             backgroundColor: currentTheme.isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)', 
             borderColor: currentTheme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' 
         }}>
        
      <div className={`p-3 border-b ${currentTheme.isDark ? 'border-white/10 text-white' : 'border-black/5 text-gray-800'}`}>
          <h4 className="text-xs font-semibold uppercase tracking-wider opacity-70">Temas</h4>
      </div>
      
      <div className="p-2 grid grid-cols-1 gap-1 max-h-64 overflow-y-auto custom-scrollbar">
          {themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => {
                    onSelect(theme.id);
                    onClose();
                }}
                className={`flex items-center gap-3 w-full p-2 rounded-lg text-sm transition-all
                    ${currentTheme.id === theme.id 
                        ? (theme.isDark ? 'bg-white/10' : 'bg-black/5') 
                        : 'hover:bg-white/5'
                    }
                    ${currentTheme.isDark ? 'text-gray-200' : 'text-gray-700'}
                `}
              >
                  {/* Theme Preview Dot */}
                  <div className={`w-6 h-6 rounded-full border shadow-sm flex-shrink-0 relative overflow-hidden ${theme.colors.bg.replace('bg-', 'bg-')}`} style={{ borderColor: 'rgba(128,128,128,0.2)' }}>
                      <div className={`absolute inset-0 opacity-50 ${theme.colors.orb1}`}></div>
                  </div>
                  <span>{theme.name}</span>
                  {currentTheme.id === theme.id && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-auto opacity-50">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                  )}
              </button>
          ))}
      </div>
    </div>
  );
};

export default ThemeSelector;