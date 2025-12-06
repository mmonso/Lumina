import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import LiquidBackground from './components/LiquidBackground';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ThemeSelector from './components/ThemeSelector';
import ToastNotification from './components/ToastNotification';
import Dashboard from './components/Dashboard';
import NewChatModal from './components/NewChatModal';
import { Message, Role, Attachment, GroundingMetadata, ThemeConfig, Toast, ToastType } from './types';
import { geminiService } from './services/geminiService';
import { getThemeById, themes } from './themes';

// Lazy load SettingsModal for performance optimization
const SettingsModal = lazy(() => import('./components/SettingsModal'));

// Simple UUID fallback
const generateId = () => Math.random().toString(36).substring(2, 15);
const STORAGE_KEY = 'lumina_chat_history';
const INSTRUCTION_KEY = 'lumina_system_instruction';
const THEME_KEY = 'lumina_theme_id';
const CHAT_NAME_KEY = 'lumina_chat_name';

const DEFAULT_INSTRUCTION = "Você é um assistente virtual útil, conciso e elegante. Você responde em Português do Brasil. Suas respostas devem ser formatadas de maneira limpa.";

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'chat'>('dashboard');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(DEFAULT_INSTRUCTION);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(themes[0]);
  const [chatName, setChatName] = useState<string>("");
  
  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Edit State
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editInputText, setEditInputText] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Toast Management
  const addToast = (message: string, type: ToastType = 'info') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initialize chat service and load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    const savedInstruction = localStorage.getItem(INSTRUCTION_KEY);
    const savedThemeId = localStorage.getItem(THEME_KEY);
    const savedChatName = localStorage.getItem(CHAT_NAME_KEY);
    
    if (savedInstruction) {
      setSystemInstruction(savedInstruction);
    }
    
    if (savedThemeId) {
        setCurrentTheme(getThemeById(savedThemeId));
    }

    if (savedChatName) {
        setChatName(savedChatName);
    }

    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const initialMessages = parsed.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp || Date.now()
        }));

        if (initialMessages.length > 0) {
          setMessages(initialMessages);
          geminiService.startChat(initialMessages, savedInstruction || DEFAULT_INSTRUCTION);
          // Don't auto-switch to chat, let Dashboard handle it via "Continue" button
          // unless user was deep-linked or reload behavior preference (optional)
          // For now, start at dashboard if history exists, giving user choice
          setView('dashboard'); 
        }
      } catch (e) {
        console.error("Failed to parse history", e);
        addToast("Erro ao carregar histórico", 'error');
      }
    }
    
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages, isInitialized]);

  const handleThemeChange = (themeId: string) => {
      const newTheme = getThemeById(themeId);
      setCurrentTheme(newTheme);
      localStorage.setItem(THEME_KEY, themeId);
      addToast(`Tema alterado para ${newTheme.name}`, 'info');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (view === 'chat') {
        scrollToBottom();
    }
  }, [messages, view]);

  const handleStopGeneration = () => {
      if (isLoading) {
          geminiService.abort();
          setIsLoading(false);
          setMessages(prev => prev.map(msg => 
              msg.isStreaming ? { ...msg, isStreaming: false, text: msg.text + " [Interrompido]" } : msg
          ));
          addToast("Geração interrompida", 'info');
      }
  };

  const handleEditMessage = (id: string, text: string) => {
      setEditingMessageId(id);
      setEditInputText(text);
  };

  const handleCancelEdit = () => {
      setEditingMessageId(null);
      setEditInputText('');
      addToast("Edição cancelada", 'info');
  };

  const handleSendMessage = async (text: string, attachments: Attachment[], useSearch: boolean) => {
    let baseMessages = messages;

    if (editingMessageId) {
        const index = messages.findIndex(m => m.id === editingMessageId);
        if (index !== -1) {
            baseMessages = messages.slice(0, index);
            geminiService.startChat(baseMessages, systemInstruction);
        }
    }

    setEditingMessageId(null);
    setEditInputText('');

    const userMessage: Message = {
      id: generateId(),
      role: Role.User,
      text: text,
      attachments: attachments,
      timestamp: Date.now()
    };

    setMessages([...baseMessages, userMessage]);
    setIsLoading(true);

    const modelMessageId = generateId();
    
    setMessages((prev) => [
      ...prev, 
      {
        id: modelMessageId,
        role: Role.Model,
        text: '',
        isStreaming: true,
        groundingMetadata: null,
        timestamp: Date.now()
      }
    ]);

    try {
      let fullText = '';
      let finalMetadata: GroundingMetadata | null = null;
      
      await geminiService.sendMessageStream(text, attachments, useSearch, (chunkText, metadata) => {
        fullText += chunkText;
        if (metadata) {
            finalMetadata = metadata;
        }
        
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === modelMessageId 
              ? { ...msg, text: fullText, groundingMetadata: finalMetadata || msg.groundingMetadata } 
              : msg
          )
        );
      });
      
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === modelMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      console.error(error);
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === modelMessageId 
            ? { ...msg, text: "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.", isStreaming: false } 
            : msg
        )
      );
      addToast("Erro ao comunicar com Gemini", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CHAT_NAME_KEY);
    setChatName("");
    
    const greeting: Message = {
        id: generateId(),
        role: Role.Model,
        text: "Memória limpa. Como posso ajudar você agora?",
        isStreaming: false,
        timestamp: Date.now()
    };
    setMessages([greeting]);
    geminiService.startChat([greeting], systemInstruction);
    addToast("Histórico limpo", 'success');
  };

  const handleSaveSettings = (newInstruction: string) => {
    setSystemInstruction(newInstruction);
    localStorage.setItem(INSTRUCTION_KEY, newInstruction);
    geminiService.startChat(messages, newInstruction);
    addToast("Configurações salvas", 'success');
  };

  const handleStartNewChat = (name: string, instruction: string, themeId: string) => {
    // 1. Update Settings & Name
    setChatName(name);
    localStorage.setItem(CHAT_NAME_KEY, name);

    setSystemInstruction(instruction);
    localStorage.setItem(INSTRUCTION_KEY, instruction);
    
    const newTheme = getThemeById(themeId);
    setCurrentTheme(newTheme);
    localStorage.setItem(THEME_KEY, themeId);

    // 2. Clear History
    localStorage.removeItem(STORAGE_KEY);

    // 3. Initialize Chat
    const greeting: Message = {
        id: generateId(),
        role: Role.Model,
        text: `Olá! Estou configurado como "${name || 'Nova Conversa'}". Como posso ajudar?`,
        isStreaming: false,
        timestamp: Date.now()
    };
    setMessages([greeting]);
    geminiService.startChat([greeting], instruction);
    
    // 4. Switch View
    setView('chat');
    addToast("Nova conversa iniciada", 'success');
  };

  const handleGoHome = () => {
    setView('dashboard');
  };

  const handleContinueChat = () => {
      setView('chat');
  };

  return (
    <div className={`relative w-full h-screen flex flex-col font-sans transition-colors duration-700 ${currentTheme.colors.text}`}>
      <LiquidBackground theme={currentTheme} />
      
      <ToastNotification toasts={toasts} removeToast={removeToast} />

      <NewChatModal 
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onStart={handleStartNewChat}
        currentTheme={currentTheme}
      />

      <Suspense fallback={null}>
        {isSettingsOpen && (
          <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            currentInstruction={systemInstruction}
            onSave={handleSaveSettings}
          />
        )}
      </Suspense>

      {/* Conditional Header */}
      {view === 'chat' && (
        <header className="flex-none p-6 text-center z-10 relative flex justify-between items-center md:justify-center animate-fade-in-up">
            
            {/* Home Button (Mobile/Desktop Left) */}
            <div className="absolute left-6 top-6">
                <button 
                    onClick={handleGoHome}
                    className={`p-2 rounded-lg transition-all duration-300 ${currentTheme.colors.textMuted} hover:${currentTheme.colors.text} hover:bg-black/5`}
                    title="Voltar ao Dashboard"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-hidden px-10">
                <h1 className={`text-xl md:text-3xl font-thin tracking-[0.2em] drop-shadow-md transition-colors duration-500 truncate ${currentTheme.isDark ? 'text-white/90' : 'text-slate-800'}`}>
                {chatName || 'LUMINA'}
                </h1>
                <p className={`text-[10px] md:text-xs tracking-widest mt-1 uppercase transition-colors duration-500 ${currentTheme.colors.textMuted}`}>Gemini 2.5 Flash</p>
            </div>
            
            {/* Header Actions */}
            <div className="absolute right-6 top-6 flex items-center gap-2">
                
                {/* Theme Selector */}
                <div className="relative">
                    <button 
                        onClick={() => setIsThemeSelectorOpen(!isThemeSelectorOpen)}
                        className={`p-2 rounded-lg transition-all duration-300 ${currentTheme.colors.textMuted} hover:${currentTheme.colors.text} hover:bg-black/5`}
                        title="Alterar Tema"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.85 6.361a15.996 15.996 0 00-4.647 4.763m0 0a15.998 15.998 0 01-3.408 1.636m0 0c-.59.82-.98 1.745-1.124 2.73m0 0a2.25 2.25 0 002.245 2.4H6.17" />
                        </svg>
                    </button>
                    {isThemeSelectorOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsThemeSelectorOpen(false)}></div>
                            <ThemeSelector 
                                currentTheme={currentTheme} 
                                onSelect={handleThemeChange} 
                                onClose={() => setIsThemeSelectorOpen(false)} 
                            />
                        </>
                    )}
                </div>

                {/* Settings Button */}
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className={`p-2 rounded-lg transition-all duration-300 ${currentTheme.colors.textMuted} hover:${currentTheme.colors.text} hover:bg-black/5`}
                    title="Configurações de Persona"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>

                {/* Clear History Button */}
                <button 
                    onClick={handleClearHistory}
                    className={`p-2 rounded-lg transition-all duration-300 ${currentTheme.colors.textMuted} hover:${currentTheme.colors.text} hover:bg-black/5`}
                    title="Limpar Histórico"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                </button>
            </div>
        </header>
      )}

      {/* Main Content: Dashboard OR Chat */}
      <main className="flex-1 w-full max-w-4xl mx-auto overflow-hidden flex flex-col relative z-10">
        
        {view === 'dashboard' ? (
            <Dashboard 
                onNewChat={() => setIsNewChatModalOpen(true)} 
                onContinue={handleContinueChat}
                activeChatName={messages.length > 0 ? (chatName || "Conversa Sem Nome") : null}
                theme={currentTheme} 
            />
        ) : (
            <>
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 scrollbar-hide">
                {messages.map((msg) => (
                    <ChatMessage 
                        key={msg.id} 
                        message={msg} 
                        theme={currentTheme} 
                        onEdit={handleEditMessage}
                    />
                ))}
                <div ref={messagesEndRef} className="h-4" />
                </div>
                
                {/* Input Area */}
                <div className="flex-none pt-4">
                <ChatInput 
                    onSend={handleSendMessage} 
                    onStop={handleStopGeneration}
                    isLoading={isLoading} 
                    theme={currentTheme} 
                    initialText={editInputText}
                    isEditing={!!editingMessageId}
                    onCancelEdit={handleCancelEdit}
                />
                </div>
            </>
        )}
      </main>
    </div>
  );
};

export default App;