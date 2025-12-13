import React, { useState } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Role, ThemeConfig } from '../types';
import AudioPlayer from './AudioPlayer';
import ImageLightbox from './ImageLightbox';
import CodeBlock from './CodeBlock';

interface ChatMessageProps {
  message: Message;
  theme: ThemeConfig;
  onEdit?: (id: string, newText: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, theme, onEdit }) => {
  const isUser = message.role === Role.User;
  const [copied, setCopied] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const handleCopy = () => {
    if (!message.text) return;
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditClick = () => {
    if (isUser && onEdit) {
      onEdit(message.id, message.text);
    }
  };

  // Format time (e.g., 14:30)
  const time = new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Extract unique sources for display
  const sources = message.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web?.uri && chunk.web?.title)
    .map(chunk => chunk.web!)
    .filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

  // Dynamic Styles based on theme
  const bubbleClass = isUser ? theme.colors.bubbleUser : theme.colors.bubbleModel;
  const glowClass = isUser ? `bg-${theme.colors.accent}-500/10` : '';
  const dotColorClass = theme.isDark ? `bg-${theme.colors.accent}-400` : `bg-${theme.colors.accent}-500`;
  
  // Animation Class Logic: 
  // User: Standard fast entrance (fade-in-up).
  // Bot (Thinking/No Text): Standard fast entrance (fade-in-up).
  // Bot (Text Arrived): "Fade In Slow" - Pure Opacity Fade (No movement/blur).
  const animationClass = isUser 
    ? 'animate-fade-in-up' 
    : (message.text ? 'animate-fade-in-slow' : 'animate-fade-in-up');

  // Custom Markdown Components
  const markdownComponents: Components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      if (!inline && match) {
        return (
          <CodeBlock language={language} theme={theme}>
            {String(children).replace(/\n$/, '')}
          </CodeBlock>
        );
      }
      return <code className={className} {...props}>{children}</code>;
    },
    p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    pre({ children }) { return <>{children}</>; }
  };

  return (
    <>
      <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} ${animationClass} group/message relative`}>
        
        <div
          className={`
            relative max-w-[85%] md:max-w-[75%] px-6 py-4 rounded-2xl text-base shadow-lg
            transition-[background-color,box-shadow,transform,filter,border-color] duration-300
            ${bubbleClass}
            ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}
            backdrop-blur-md border
            ${isUser ? 'cursor-pointer hover:brightness-95 hover:shadow-xl active:scale-[0.99]' : ''}
          `}
          onClick={handleEditClick}
        >
          {/* Edit Button - Positioned absolute relative to the bubble */}
          {isUser && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick();
              }}
              className={`
                absolute top-1/2 -translate-y-1/2 right-full mr-3
                p-2 rounded-full opacity-0 group-hover/message:opacity-100 transition-all duration-300 scale-90 group-hover/message:scale-100
                ${theme.isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-black/40 hover:text-black hover:bg-black/5'}
              `}
              title="Editar mensagem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
          )}

          {isUser && <div className={`absolute inset-0 rounded-2xl blur-xl -z-10 ${glowClass}`}></div>}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {message.attachments.map((att, index) => (
                <div key={index} className={`rounded-lg overflow-hidden border ${theme.isDark ? 'border-white/10 bg-black/20' : 'border-black/5 bg-white/40'}`}>
                  {att.type === 'image' ? (
                    <img 
                      src={att.data} alt="attachment" 
                      className="max-w-full max-h-[300px] object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); setLightboxSrc(att.data); }}
                    />
                  ) : (
                    <div className="p-1" onClick={(e) => e.stopPropagation()}><AudioPlayer src={att.data} theme={theme} /></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message Content */}
          <div 
            className={`
                markdown-content font-normal leading-relaxed min-h-[1em] 
                ${message.isStreaming ? 'streaming-active' : ''}
            `}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {message.text}
            </ReactMarkdown>
          </div>
          
          {/* Sources */}
          {!isUser && !message.isStreaming && sources && sources.length > 0 && (
            <div className={`mt-4 pt-3 border-t animate-fade-in-up ${theme.isDark ? 'border-white/10' : 'border-black/5'}`}>
              <div className={`text-[10px] uppercase tracking-widest mb-2 font-semibold flex items-center gap-1 ${theme.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Fontes Encontradas
              </div>
              <div className="flex flex-wrap gap-2">
                {sources.map((source, idx) => (
                  <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className={`border rounded-lg px-3 py-2 text-xs transition-all flex items-center gap-2 max-w-full truncate ${theme.isDark ? 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/20 text-indigo-200' : 'bg-black/5 hover:bg-black/10 border-black/5 hover:border-black/10 text-indigo-800'}`}>
                    <span className="truncate max-w-[150px]">{source.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className={`flex items-center mt-3 ${isUser ? 'justify-end' : 'justify-between'} min-h-[28px]`}>
              <div className="flex items-center gap-3">
                 <span className={`text-[10px] uppercase tracking-widest font-semibold select-none opacity-50 flex items-center order-1`}>
                    {isUser ? 'Você' : 'Gemini'}
                    <span className="mx-1.5 opacity-50">•</span>
                    {time}
                 </span>
                 
                 {/* Loading/Thinking Indicator - Only show if empty text (waiting for first chunk) */}
                 {!isUser && message.isStreaming && !message.text && (
                    <div className={`order-2 flex items-center gap-1 px-2 py-1 rounded-full animate-fade-in-up ${theme.isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                        <span className={`w-1 h-1 rounded-full animate-liquid-dot ${dotColorClass}`} style={{ animationDelay: '0s' }}></span>
                        <span className={`w-1 h-1 rounded-full animate-liquid-dot ${dotColorClass}`} style={{ animationDelay: '0.2s' }}></span>
                        <span className={`w-1 h-1 rounded-full animate-liquid-dot ${dotColorClass}`} style={{ animationDelay: '0.4s' }}></span>
                    </div>
                 )}
              </div>

              {!isUser && !message.isStreaming && (
                  <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className="p-1.5 rounded-lg opacity-50 hover:opacity-100 transition-all duration-300 group">
                      {copied ? <span className="text-emerald-500 text-xs">Copiado</span> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" /></svg>}
                  </button>
              )}
          </div>
        </div>
      </div>

      <ImageLightbox src={lightboxSrc || ''} isOpen={!!lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </>
  );
};

export default ChatMessage;