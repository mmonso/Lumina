
import React, { useState } from 'react';
import { ThemeConfig } from '../types';
import ThemeSelector from './ThemeSelector';

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  theme: ThemeConfig;
  onThemeChange: (themeId: string) => void;
  isLoading: boolean;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, theme, onThemeChange, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 backdrop-blur-md ${theme.isDark
      ? 'bg-white/5 border border-white/10 focus:bg-white/10 focus:border-white/30 text-white placeholder-white/30'
      : 'bg-black/5 border border-black/5 focus:bg-white/40 focus:border-black/10 text-slate-800 placeholder-black/30'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">

      {/* Theme Selector - Top Right */}
      <div className="absolute top-6 right-6 z-[60]">
        <div className="relative">
          {isThemeSelectorOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsThemeSelectorOpen(false)}></div>
              <ThemeSelector
                currentTheme={theme}
                onSelect={onThemeChange}
                onClose={() => setIsThemeSelectorOpen(false)}
                align="right"
                direction="down"
              />
            </>
          )}
          <button
            onClick={() => setIsThemeSelectorOpen(!isThemeSelectorOpen)}
            className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300
                    backdrop-blur-sm border border-transparent
                    ${theme.isDark
                ? 'text-white/40 hover:text-white hover:bg-white/5 hover:border-white/10'
                : 'text-slate-400 hover:text-slate-800 hover:bg-black/5 hover:border-black/5'
              }
                `}
          >
            <div className={`w-3 h-3 rounded-full border shadow-sm relative overflow-hidden ${theme.colors.bg.replace('bg-', 'bg-')}`} style={{ borderColor: 'currentColor' }}>
              <div className={`absolute inset-0 opacity-50 ${theme.colors.orb1}`}></div>
            </div>
            <span className="text-[10px] uppercase tracking-widest font-medium hidden sm:block">Tema</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 opacity-60">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Container */}
      <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl backdrop-blur-2xl border animate-fade-in-up ${theme.isDark ? 'bg-black/40 border-white/10' : 'bg-white/60 border-white/40'}`}>

        {/* Logo/Header */}
        <div className="text-center mb-10">
          <h1 className={`text-4xl font-thin tracking-[0.2em] mb-2 ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>LUMINA</h1>
          <p className={`text-xs uppercase tracking-widest opacity-60 ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>
            Acesso Restrito
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Usuário ou E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl font-medium tracking-wide shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${theme.isDark
                ? `bg-white text-black hover:bg-gray-100`
                : `bg-slate-900 text-white hover:bg-slate-800`
              }`}
          >
            {isLoading ? (
              <span className="animate-pulse">Autenticando...</span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs opacity-40">
          Single Use Mode v1.0
        </div>

      </div>
    </div>
  );
};

export default AuthScreen;
