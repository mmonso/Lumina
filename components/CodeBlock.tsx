import React, { useState } from 'react';
import { ThemeConfig } from '../types';

interface CodeBlockProps {
  language: string;
  children: React.ReactNode;
  theme: ThemeConfig;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, children, theme }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!children) return;
    
    // Extract text content from children
    let textToCopy = '';
    if (typeof children === 'string') {
        textToCopy = children;
    } else if (Array.isArray(children)) {
        textToCopy = children.map(child => (typeof child === 'string' ? child : String(child))).join('');
    } else {
        // Fallback for complex ReactNode
        const element = document.createElement('div');
        // This is a naive way to get text from react node if we can't simple access it
        // However, react-markdown typically passes string as children to the code component
        textToCopy = String(children); 
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`my-4 rounded-lg overflow-hidden border ${theme.isDark ? 'border-white/10' : 'border-black/10'} shadow-lg`}>
      <div className={`
        flex items-center justify-between px-4 py-2 text-xs font-mono
        ${theme.isDark ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-600'}
      `}>
        <span className="uppercase tracking-wider opacity-80">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity`}
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-emerald-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-emerald-500">Copiado</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        {/* The pre style is handled globally in index.html, we just wrap it */}
        <pre className="!m-0 !rounded-none !border-none !bg-[#0f172a] !text-slate-200">
           <code className={`language-${language}`}>
              {children}
           </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;