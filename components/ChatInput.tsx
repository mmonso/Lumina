import React, { useState, useRef, useEffect } from 'react';
import { Attachment, ThemeConfig } from '../types';

interface ChatInputProps {
  onSend: (message: string, attachments: Attachment[], useSearch: boolean) => void;
  onStop?: () => void;
  isLoading: boolean;
  theme: ThemeConfig;
  initialText?: string;
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, onStop, isLoading, theme, initialText, isEditing, onCancelEdit }) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [useSearch, setUseSearch] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Populate input if initialText is provided (e.g. for editing)
  useEffect(() => {
    if (initialText !== undefined) {
        setInput(initialText);
        if (initialText && textareaRef.current) {
            textareaRef.current.focus();
        }
    }
  }, [initialText]);

  const handleSubmit = () => {
    if (isLoading) {
        if (onStop) onStop();
        return;
    }
    if ((!input.trim() && attachments.length === 0) || isRecording) return;
    onSend(input, attachments, useSearch);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape' && isEditing && onCancelEdit) {
        e.preventDefault();
        onCancelEdit();
        return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle File Selection (Image/Audio)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          const type = file.type.startsWith('image/') ? 'image' : 'audio';
          
          setAttachments(prev => [...prev, {
            type,
            mimeType: file.type,
            data: base64
          }]);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setAttachments(prev => [...prev, {
            type: 'audio',
            mimeType: 'audio/webm',
            data: base64
          }]);
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      // Let parent handle toast
      alert("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6">
      <div className="relative group">
        
        {/* Editing Mode Banner */}
        {isEditing && (
            <div className={`absolute bottom-full left-0 mb-3 w-full flex items-center justify-between px-4 py-2 rounded-xl backdrop-blur-md border animate-fade-in-up ${theme.isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200' : 'bg-indigo-500/5 border-indigo-500/10 text-indigo-700'}`}>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Editando mensagem
                </div>
                <button 
                    onClick={onCancelEdit}
                    className="flex items-center gap-1 text-xs hover:opacity-100 opacity-60 transition-opacity"
                    title="Cancelar edição (Esc)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancelar
                </button>
            </div>
        )}

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="absolute bottom-full left-0 mb-3 flex gap-2 overflow-x-auto w-full p-2 scrollbar-hide">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative group/preview flex-shrink-0 animate-fade-in-up">
                <div className={`h-16 rounded-lg overflow-hidden border flex items-center justify-center min-w-[4rem] backdrop-blur-md ${theme.isDark ? 'border-white/20 bg-black/40' : 'border-black/10 bg-white/40'}`}>
                  {att.type === 'image' ? (
                    <img src={att.data} alt="preview" className="w-16 h-16 object-cover" />
                  ) : (
                    <div className="px-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${theme.isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                        </svg>
                        <span className={`text-xs font-mono ${theme.isDark ? 'text-white/80' : 'text-black/70'}`}>Áudio</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => removeAttachment(idx)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Ambient glow behind input */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${isRecording ? 'from-red-500 to-orange-600' : `from-${theme.colors.accent}-500 to-${theme.colors.accent}-400`} rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-500`}></div>
        
        <div className={`relative flex items-end gap-2 backdrop-blur-xl border rounded-2xl p-2 shadow-2xl transition-colors duration-500 ${theme.colors.inputBg} ${isEditing ? `ring-1 ring-${theme.colors.accent}-500/50` : ''}`}>
            
            {/* Attachment Button */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,audio/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isRecording}
              className={`p-3 rounded-xl transition-all flex-shrink-0 ${isRecording ? 'opacity-30 cursor-not-allowed' : `${theme.colors.textMuted} hover:${theme.colors.text} hover:bg-black/5`}`}
              title="Anexar imagem ou áudio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
            </button>

            {/* Google Search Toggle */}
            <button
              onClick={() => setUseSearch(!useSearch)}
              disabled={isLoading || isRecording}
              className={`
                p-3 rounded-xl transition-all duration-300 flex-shrink-0
                ${isRecording ? 'opacity-30 cursor-not-allowed' : ''}
                ${useSearch 
                    ? 'text-cyan-500 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                    : `${theme.colors.textMuted} hover:${theme.colors.text} hover:bg-black/5`
                }
              `}
              title={useSearch ? "Pesquisa Google Ativada" : "Ativar Pesquisa Google"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.546-3.131 1.567-4.382m15.686 0A17.931 17.931 0 0121 12m-1.566 4.383A8.969 8.969 0 0112 16.5V21" />
              </svg>
            </button>

            {/* Input Area / Recording Indicator */}
            <div className="flex-1 min-h-[44px] flex items-center">
                {isRecording ? (
                    <div className="w-full flex items-center gap-3 px-2 animate-in fade-in duration-300">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                        <span className={`font-mono text-sm tabular-nums tracking-wider ${theme.colors.text}`}>{formatTime(recordingTime)}</span>
                        
                        {/* Waveform Visualization */}
                        <div className={`flex-1 flex items-center gap-1 h-6 mx-2 overflow-hidden ${theme.colors.text} opacity-70`}>
                             {[...Array(12)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="w-1 bg-current rounded-full animate-pulse"
                                    style={{ 
                                        height: `${Math.max(20, Math.random() * 100)}%`,
                                        animationDelay: `${i * 0.1}s`,
                                        animationDuration: '0.8s'
                                    }}
                                ></div>
                             ))}
                        </div>
                        <span className={`text-xs uppercase tracking-widest hidden sm:block ${theme.colors.textMuted}`}>Gravando</span>
                    </div>
                ) : (
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={useSearch ? "Pergunte ao Gemini (com pesquisa Google)..." : "Pergunte algo ao Gemini..."}
                        rows={1}
                        disabled={isLoading}
                        className={`w-full bg-transparent ${theme.colors.text} placeholder-${theme.colors.accent}-400/40 px-2 py-3 focus:outline-none resize-none max-h-32 scrollbar-hide font-normal`}
                        style={{ minHeight: '44px' }}
                    />
                )}
            </div>
            
            {/* Microphone / Stop Button */}
            <button
              onClick={toggleRecording}
              disabled={isLoading}
              className={`
                p-3 rounded-xl transition-all duration-300 flex-shrink-0 group/mic
                ${isRecording 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:bg-red-500/30' 
                  : `${theme.colors.textMuted} hover:${theme.colors.text} hover:bg-black/5`
                }
              `}
              title={isRecording ? "Parar gravação" : "Gravar áudio"}
            >
              {isRecording ? (
                 /* Stop Icon */
                 <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                 </svg>
              ) : (
                 /* Mic Icon */
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover/mic:scale-110 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                 </svg>
              )}
            </button>

            {/* Send / Stop Button */}
            <button
                onClick={handleSubmit}
                disabled={(!input.trim() && attachments.length === 0 && !isLoading) || isRecording}
                className={`
                    p-3 rounded-xl transition-all duration-300 flex-shrink-0
                    ${(!input.trim() && attachments.length === 0 && !isLoading) || isRecording
                        ? `${theme.colors.textMuted} bg-transparent cursor-not-allowed opacity-50` 
                        : isLoading
                          ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/30'
                          : `${theme.isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'} hover:shadow-lg`
                    }
                `}
                title={isLoading ? "Parar geração" : "Enviar mensagem"}
            >
                {isLoading ? (
                     /* Stop Square Icon */
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 animate-pulse">
                         <rect x="7" y="7" width="10" height="10" rx="1.5" />
                    </svg>
                ) : (
                    /* Send Icon */
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;