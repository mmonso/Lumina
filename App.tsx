
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import LiquidBackground from './components/LiquidBackground';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ToastNotification from './components/ToastNotification';
import Dashboard from './components/Dashboard';
import NewChatModal from './components/NewChatModal';
import Sidebar from './components/Sidebar';
import AuthScreen from './components/AuthScreen';
import { Message, Role, Attachment, GroundingMetadata, ThemeConfig, Toast, ToastType, Project, Conversation, User } from './types';
import { geminiService } from './services/geminiService';
import { authService } from './services/authService';
import { getThemeById, themes } from './themes';

const SettingsModal = lazy(() => import('./components/SettingsModal'));

const generateId = () => Math.random().toString(36).substring(2, 15);

// Storage Keys
const PROJECTS_KEY = 'lumina_projects';
const CONVERSATIONS_KEY = 'lumina_conversations';
const HISTORY_PREFIX = 'lumina_history_';

const DEFAULT_INSTRUCTION = "Você é um assistente virtual útil, conciso e elegante. Você responde em Português do Brasil.";

const App: React.FC = () => {
  // --- State: Auth ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // --- State: Data Hierarchy ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
  // --- State: Selection ---
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // --- State: UI & Chat ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(themes[0]);
  
  // Sidebar & Layout
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Edits Project Persona
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Edit State
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editInputText, setEditInputText] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Initialization ---
  useEffect(() => {
    // Check Session
    const session = authService.getSession();
    if (session) {
      setCurrentUser(session);
    }
    
    // Load Global Data (Filtering happens in render or specific hooks)
    const savedProjects = localStorage.getItem(PROJECTS_KEY);
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) { console.error(e); }
    }

    const savedConversations = localStorage.getItem(CONVERSATIONS_KEY);
    if (savedConversations) {
        try {
            setConversations(JSON.parse(savedConversations));
        } catch (e) { console.error(e); }
    }
  }, []);

  // --- Derived State ---
  
  // Filter projects by current user
  const userProjects = currentUser 
    ? projects.filter(p => p.userId === currentUser.id)
    : [];

  const activeProject = userProjects.find(p => p.id === activeProjectId);
  const projectConversations = conversations.filter(c => c.projectId === activeProjectId).sort((a,b) => b.updatedAt - a.updatedAt);

  // Update Theme based on Active Project or Default
  useEffect(() => {
    if (activeProject) {
        setCurrentTheme(getThemeById(activeProject.themeId));
    } else if (!currentUser) {
        // Only set default if we haven't manually changed it in the auth screen?
        // Actually, let's keep it simple: if not logged in and not manually set (implied), use default.
        // But since we want to allow user to play with themes on auth screen, we shouldn't force reset here continuously.
        // The dependency array handles this. It only runs when currentUser changes (e.g. logout).
        if (currentTheme.id === themes[0].id) {
           // Optional: logic to load saved preference from localstorage if desired
        }
    }
  }, [activeProject, currentUser]);

  // --- Auth Handlers ---
  const handleLogin = async (email: string, pass: string) => {
    setIsAuthLoading(true);
    // Simulate network delay for UX
    setTimeout(() => {
      const result = authService.login(email, pass);
      setIsAuthLoading(false);
      
      if (result.success && result.user) {
        setCurrentUser(result.user);
        addToast(`Bem-vindo, ${result.user.name}!`, 'success');
      } else {
        addToast(result.error || 'Erro no login', 'error');
      }
    }, 800);
  };

  const handleRegister = async (name: string, email: string, pass: string) => {
    setIsAuthLoading(true);
    setTimeout(() => {
      const result = authService.register(name, email, pass);
      setIsAuthLoading(false);
      
      if (result.success && result.user) {
        setCurrentUser(result.user);
        addToast('Conta criada com sucesso!', 'success');
      } else {
        addToast(result.error || 'Erro no cadastro', 'error');
      }
    }, 800);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setActiveProjectId(null);
    setActiveConversationId(null);
    setMessages([]);
    setCurrentTheme(themes[0]);
    addToast('Você saiu da conta.', 'info');
  };

  // --- Logic: Projects ---

  const handleCreateProject = (name: string, instruction: string, themeId: string) => {
    if (!currentUser) return;

    const newProject: Project = {
      id: generateId(),
      userId: currentUser.id,
      name: name || "Novo Projeto",
      systemInstruction: instruction,
      themeId: themeId,
      createdAt: Date.now()
    };
    
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    
    setActiveProjectId(newProject.id);
    setActiveConversationId(null); // No conversation selected initially
    setMessages([]);
    addToast("Projeto criado", "success");
  };

  const handleUpdateProjectSettings = (newInstruction: string) => {
    if (!activeProjectId) return;
    
    const updatedProjects = projects.map(p => 
        p.id === activeProjectId ? { ...p, systemInstruction: newInstruction } : p
    );
    setProjects(updatedProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
    
    // Restart gemini context if inside a conversation
    if (activeConversationId) {
        geminiService.startChat(messages, newInstruction);
    }
    addToast("Persona do projeto atualizada", "success");
  };

  const handleRenameProject = (id: string, newName: string) => {
      const updated = projects.map(p => p.id === id ? { ...p, name: newName } : p);
      setProjects(updated);
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
  };

  const handleDeleteProject = (id: string) => {
      // Delete Project
      const updatedProjects = projects.filter(p => p.id !== id);
      setProjects(updatedProjects);
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));

      // Find Conversations to delete
      const conversationsToDelete = conversations.filter(c => c.projectId === id);
      
      // Delete History for those conversations
      conversationsToDelete.forEach(c => {
          localStorage.removeItem(`${HISTORY_PREFIX}${c.id}`);
      });

      // Update Conversations State
      const updatedConversations = conversations.filter(c => c.projectId !== id);
      setConversations(updatedConversations);
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConversations));

      if (activeProjectId === id) {
          setActiveProjectId(null);
          setActiveConversationId(null);
      }
      addToast("Projeto excluído", "info");
  };

  const handleChangeProjectTheme = (id: string, themeId: string) => {
      const updated = projects.map(p => p.id === id ? { ...p, themeId: themeId } : p);
      setProjects(updated);
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
      if (activeProjectId === id) {
          setCurrentTheme(getThemeById(themeId));
      }
  };

  // --- Logic: Conversations ---

  const handleCreateConversation = () => {
      if (!activeProjectId) return;

      const newConv: Conversation = {
          id: generateId(),
          projectId: activeProjectId,
          title: "Nova Conversa",
          updatedAt: Date.now()
      };

      const updatedConversations = [newConv, ...conversations];
      setConversations(updatedConversations);
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConversations));

      handleSelectConversation(newConv.id);
  };

  const handleSelectConversation = (id: string) => {
      if (id === activeConversationId) return;

      setActiveConversationId(id);
      setIsSidebarOpen(false);

      // Load History
      const historyKey = `${HISTORY_PREFIX}${id}`;
      const savedHistory = localStorage.getItem(historyKey);
      let loadedMessages: Message[] = [];
      
      if (savedHistory) {
          try {
              loadedMessages = JSON.parse(savedHistory);
          } catch(e) { console.error(e); }
      }
      
      setMessages(loadedMessages);

      // Start Service with Project's Persona
      if (activeProject) {
        geminiService.startChat(loadedMessages, activeProject.systemInstruction);
      }
  };

  const handleDeleteConversation = (id: string) => {
      const updated = conversations.filter(c => c.id !== id);
      setConversations(updated);
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated));
      localStorage.removeItem(`${HISTORY_PREFIX}${id}`);

      if (activeConversationId === id) {
          setActiveConversationId(null);
          setMessages([]);
      }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    const updated = conversations.map(c => c.id === id ? { ...c, title: newTitle } : c);
    setConversations(updated);
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated));
  };

  // --- Messaging Logic ---

  useEffect(() => {
      if (activeConversationId) {
          localStorage.setItem(`${HISTORY_PREFIX}${activeConversationId}`, JSON.stringify(messages));
      }
  }, [messages, activeConversationId]);

  const scrollToBottom = () => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  useEffect(() => {
      if (activeConversationId) scrollToBottom();
  }, [messages.length, activeConversationId]);

  const handleScroll = () => {
      if (messagesContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
          setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 150);
      }
  };

  const handleSendMessage = async (text: string, attachments: Attachment[], useSearch: boolean) => {
      if (!activeProjectId) return; // Should not happen

      // Auto-create conversation if inside project but no chat selected
      let currentConvId = activeConversationId;
      if (!currentConvId) {
          const newConv: Conversation = {
              id: generateId(),
              projectId: activeProjectId,
              title: "Nova Conversa",
              updatedAt: Date.now()
          };
          const updatedConversations = [newConv, ...conversations];
          setConversations(updatedConversations);
          localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updatedConversations));
          
          setActiveConversationId(newConv.id);
          currentConvId = newConv.id;
          
          // Initialize service
          if (activeProject) geminiService.startChat([], activeProject.systemInstruction);
      }

      let baseMessages = messages;
      // Handle Edit Branching
      if (editingMessageId) {
          const index = messages.findIndex(m => m.id === editingMessageId);
          if (index !== -1) {
              baseMessages = messages.slice(0, index);
              if (activeProject) geminiService.startChat(baseMessages, activeProject.systemInstruction);
          }
      }

      // Auto-Naming Logic for Conversation (Not Project)
      if (baseMessages.length === 0 && text.trim().length > 0 && currentConvId) {
          const targetId = currentConvId;
          
          // 1. Fallback name
          const fallbackName = text.substring(0, 25) + (text.length > 25 ? "..." : "");
          setConversations(prev => {
              const updated = prev.map(c => c.id === targetId ? { ...c, title: fallbackName, updatedAt: Date.now() } : c);
              localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated));
              return updated;
          });

          // 2. AI Name
          const titleInput = text.length > 300 ? text.substring(0, 300) + "..." : text;
          geminiService.generateTitle(titleInput).then(aiTitle => {
              if (aiTitle && aiTitle.length >= 2) {
                  setConversations(prev => {
                      const updated = prev.map(c => c.id === targetId ? { ...c, title: aiTitle } : c);
                      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated));
                      return updated;
                  });
              }
          });
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
      setMessages(prev => [...prev, {
          id: modelMessageId,
          role: Role.Model,
          text: '',
          isStreaming: true,
          timestamp: Date.now()
      }]);

      try {
          const result = await geminiService.sendMessage(text, attachments, useSearch);
          setMessages(prev => prev.map(msg => msg.id === modelMessageId ? {
              ...msg,
              text: result.text,
              groundingMetadata: result.metadata,
              isStreaming: false
          } : msg));
      } catch (error) {
          console.error(error);
          setMessages(prev => prev.map(msg => msg.id === modelMessageId ? {
              ...msg,
              text: "Erro ao comunicar com Gemini.",
              isStreaming: false
          } : msg));
          addToast("Erro na comunicação", "error");
      } finally {
          setIsLoading(false);
      }
  };

  const handleStopGeneration = () => {
    if (isLoading) {
        geminiService.abort();
        setIsLoading(false);
        setMessages(prev => prev.map(msg => 
            msg.isStreaming ? { ...msg, isStreaming: false, text: msg.text + " [Interrompido]" } : msg
        ));
    }
  };

  const handleEditMessage = (id: string, text: string) => {
      setEditingMessageId(id);
      setEditInputText(text);
  };

  const handleCancelEdit = () => {
      setEditingMessageId(null);
      setEditInputText('');
  };

  return (
    <div className={`relative w-full h-screen flex overflow-hidden font-sans transition-colors duration-700 ${currentTheme.colors.text}`}>
      <LiquidBackground theme={currentTheme} />
      <ToastNotification toasts={toasts} removeToast={removeToast} />

      {/* Auth Screen Overlay */}
      {!currentUser && (
        <AuthScreen 
          onLogin={handleLogin} 
          onRegister={handleRegister} 
          theme={currentTheme}
          onThemeChange={(id) => setCurrentTheme(getThemeById(id))}
          isLoading={isAuthLoading} 
        />
      )}

      {/* Main App - Only rendered when user exists, but kept in DOM to prevent flickers, just covered by AuthScreen */}
      {currentUser && (
        <>
          {/* Sidebar - ONLY RENDER IF A PROJECT IS ACTIVE */}
          {activeProjectId && (
            <Sidebar 
                isOpen={isSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                onCloseMobile={() => setIsSidebarOpen(false)}
                
                currentUser={currentUser}
                activeProjectId={activeProjectId}
                activeConversationId={activeConversationId}
                projects={userProjects}
                conversations={projectConversations} 
                
                onSelectProject={(id) => {
                    // Not used in this mode
                }}
                onSelectConversation={handleSelectConversation}
                
                onNewProject={() => { /* Handled in dashboard */ }}
                onNewConversation={handleCreateConversation}
                
                onDeleteProject={handleDeleteProject}
                onDeleteConversation={handleDeleteConversation}
                
                onRenameProject={handleRenameProject}
                onRenameConversation={handleRenameConversation}
                
                onBackToProjects={() => setActiveProjectId(null)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onLogout={handleLogout}
                
                theme={currentTheme}
                onThemeChange={(tid) => handleChangeProjectTheme(activeProjectId, tid)}
            />
          )}

          <main className="flex-1 flex flex-col h-full relative overflow-hidden transition-all duration-300">
            {/* Mobile Toggle - Only show if Sidebar is active (Project Active) */}
            {activeProjectId && (
                <div className="md:hidden absolute top-4 left-4 z-30">
                    <button onClick={() => setIsSidebarOpen(true)} className={`p-2 rounded-lg backdrop-blur-md border shadow-lg ${currentTheme.isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-white/60 border-black/5 text-slate-800'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                    </button>
                </div>
            )}

            {!activeProjectId ? (
                <Dashboard 
                    projects={userProjects}
                    onNewProject={() => setIsNewProjectModalOpen(true)}
                    onSelectProject={(id) => {
                        setActiveProjectId(id);
                        setActiveConversationId(null);
                        setMessages([]);
                    }}
                    onRenameProject={handleRenameProject}
                    onDeleteProject={handleDeleteProject}
                    theme={currentTheme}
                    onThemeChange={(tid) => setCurrentTheme(getThemeById(tid))}
                />
            ) : (
                // Inside a Project
                <div className="flex flex-col h-full relative">
                    
                    {/* Chat Area */}
                    {activeConversationId ? (
                        <>
                            <div 
                                ref={messagesContainerRef}
                                onScroll={handleScroll}
                                className="flex-1 overflow-y-auto min-h-0 pb-4 pt-24 md:pt-10 scrollbar-hide px-2"
                                style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 50px, black 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 50px, black 100%)' }}
                            >
                                <div className="w-full max-w-4xl mx-auto px-4">
                                    {messages.map((msg) => (
                                        <ChatMessage key={msg.id} message={msg} theme={currentTheme} onEdit={handleEditMessage} />
                                    ))}
                                    <div ref={messagesEndRef} className="h-[40vh] md:h-[45vh] w-full flex-shrink-0" />
                                </div>
                            </div>

                            <button
                                onClick={scrollToBottom}
                                className={`absolute bottom-24 right-6 md:right-10 z-20 p-2.5 rounded-full shadow-xl backdrop-blur-md border transition-all duration-500 ${currentTheme.isDark ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-white/60 border-black/5 text-slate-800 hover:bg-white/80'} ${showScrollBottom ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
                            </button>

                            <div className="flex-none pt-2 pb-6">
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
                    ) : (
                        // Project Selected, but no Conversation Active
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
                            <div className={`p-6 rounded-full mb-6 ${currentTheme.isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 opacity-50">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.375.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-light mb-2">{activeProject.name}</h2>
                            <p className="opacity-60 max-w-md mb-8">Selecione ou crie uma conversa para começar.</p>
                            <button 
                                onClick={handleCreateConversation}
                                className={`px-8 py-3 rounded-xl shadow-lg transition-transform hover:scale-105 ${currentTheme.isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white/60 hover:bg-white/80'}`}
                            >
                                Nova Conversa
                            </button>
                        </div>
                    )}
                </div>
            )}
          </main>

          <NewChatModal 
            isOpen={isNewProjectModalOpen}
            onClose={() => setIsNewProjectModalOpen(false)}
            onStart={handleCreateProject}
            currentTheme={currentTheme}
          />

          <Suspense fallback={null}>
            {isSettingsOpen && activeProjectId && (
              <SettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentInstruction={activeProject?.systemInstruction || DEFAULT_INSTRUCTION}
                onSave={handleUpdateProjectSettings}
                theme={currentTheme}
              />
            )}
          </Suspense>
        </>
      )}
    </div>
  );
};

export default App;
