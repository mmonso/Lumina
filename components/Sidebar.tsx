
import React, { useState, useRef, useEffect } from 'react';
import { Project, Conversation, ThemeConfig, User } from '../types';
import ThemeSelector from './ThemeSelector';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  
  // State from App
  currentUser: User | null;
  activeProjectId: string | null;
  activeConversationId: string | null;
  projects: Project[]; // Needed only to find current project name
  conversations: Conversation[]; 

  // Actions
  onSelectProject: (id: string) => void;
  onSelectConversation: (id: string) => void;
  
  onNewProject: () => void;
  onNewConversation: () => void;
  
  onDeleteProject: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  
  onRenameProject: (id: string, name: string) => void;
  onRenameConversation: (id: string, name: string) => void;
  
  onBackToProjects: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  
  theme: ThemeConfig;
  onThemeChange: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen, onCloseMobile, isCollapsed, onToggleCollapse,
  currentUser,
  activeProjectId, activeConversationId, projects, conversations,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onRenameProject,
  onBackToProjects, onOpenSettings, onLogout,
  theme, onThemeChange
}) => {
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  
  // Conversation editing state
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editConvName, setEditConvName] = useState("");
  const convInputRef = useRef<HTMLInputElement>(null);

  // Project editing state
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editProjectName, setEditProjectName] = useState("");
  const projectInputRef = useRef<HTMLInputElement>(null);

  const currentProjectName = projects.find(p => p.id === activeProjectId)?.name || "Projeto";

  // Focus management
  useEffect(() => {
    if (editingConvId && convInputRef.current) convInputRef.current.focus();
  }, [editingConvId]);

  useEffect(() => {
    if (isEditingProject && projectInputRef.current) {
        setEditProjectName(currentProjectName);
        projectInputRef.current.focus();
    }
  }, [isEditingProject, currentProjectName]);


  // Conversation Editing Handlers
  const startEditConv = (id: string, name: string) => {
      setEditingConvId(id);
      setEditConvName(name);
  };
  const saveEditConv = () => {
      if (editingConvId && editConvName.trim()) {
           onRenameConversation(editingConvId, editConvName);
      }
      setEditingConvId(null);
  };
  const handleConvKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') saveEditConv();
      if (e.key === 'Escape') setEditingConvId(null);
  };

  // Project Editing Handlers
  const startEditProject = () => {
      setIsEditingProject(true);
      setEditProjectName(currentProjectName);
  };
  const saveEditProject = () => {
      if (activeProjectId && editProjectName.trim()) {
          onRenameProject(activeProjectId, editProjectName.trim());
      }
      setIsEditingProject(false);
  };
  const handleProjectKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') saveEditProject();
      if (e.key === 'Escape') setIsEditingProject(false);
  };

  // Get User Initials
  const userInitials = currentUser?.name 
    ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '??';

  return (
    <>
      {/* Mobile Overlay */}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onCloseMobile} />

      {/* Desktop Collapse Toggle */}
      <button
            onClick={onToggleCollapse}
            className={`hidden md:flex fixed top-6 z-50 w-8 h-8 rounded-full border items-center justify-center transition-all duration-500 shadow-lg backdrop-blur-md ${theme.isDark ? 'bg-slate-900/50 border-white/20 text-white hover:bg-slate-800' : 'bg-white/50 border-black/10 text-slate-800 hover:bg-white/80'} hover:scale-110`}
            style={{ left: isCollapsed ? '1.5rem' : '17rem' }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform duration-500 ${isCollapsed ? '' : 'rotate-180'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5L18.75 12 11.25 19.5M5.25 4.5l7.5 7.5-7.5 7.5" /></svg>
      </button>

      {/* Sidebar Container */}
      <div className={`fixed md:static inset-y-0 left-0 z-40 h-full flex flex-col transition-all duration-500 ease-in-out transform md:transform-none overflow-hidden border-r backdrop-blur-2xl shadow-2xl md:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${isCollapsed ? 'md:w-0 md:border-none' : 'md:w-72'} w-72 ${theme.isDark ? 'bg-black/40 border-white/10' : 'bg-white/60 border-black/5'}`}>
        <div className="w-72 flex flex-col h-full">
            
            {/* Header Area: Ultra Minimalist */}
            <div className="p-5 flex-none flex flex-col gap-6">
                
                {/* Top Row: Navigation Icons (Grouped Left) */}
                <div className="flex items-center gap-1">
                     {/* Home Icon */}
                     <button 
                        onClick={onBackToProjects} 
                        className={`p-2 -ml-2 rounded-full transition-all duration-300 group ${theme.isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-800 hover:bg-black/5'}`}
                        title="Voltar ao Início"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                     </button>
                     
                     {/* New Chat Icon - Grouped Left */}
                     <button 
                        onClick={onNewConversation} 
                        className={`p-2 rounded-full transition-all duration-300 group ${theme.isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-800 hover:bg-black/5'}`}
                        title="Nova Conversa"
                     >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:rotate-90 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                     </button>
                </div>
                
                {/* Project Title */}
                <div className="group/title relative px-1">
                    {isEditingProject ? (
                        <input 
                            ref={projectInputRef}
                            type="text" 
                            value={editProjectName}
                            onChange={(e) => setEditProjectName(e.target.value)}
                            onBlur={saveEditProject}
                            onKeyDown={handleProjectKeyDown}
                            className={`w-full bg-transparent border-b ${theme.isDark ? 'border-white/50 text-white' : 'border-black/50 text-black'} focus:outline-none py-1 text-xl font-light tracking-wide`}
                        />
                    ) : (
                        <div className="flex items-center justify-between gap-2">
                            <h2 className={`text-xl font-light tracking-wide truncate ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>
                                {currentProjectName}
                            </h2>
                            <button 
                                onClick={startEditProject} 
                                className={`opacity-0 group-hover/title:opacity-100 transition-opacity p-1.5 rounded-md ${theme.isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-black/5 text-black/50'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                </svg>
                            </button>
                        </div>
                    )}
                    
                    {/* Minimal Separator */}
                    <div className={`h-px w-full mt-4 ${theme.isDark ? 'bg-gradient-to-r from-white/20 to-transparent' : 'bg-gradient-to-r from-black/10 to-transparent'}`}></div>
                </div>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-hide space-y-1">
                {conversations.length === 0 ? (
                    <div className="text-center py-10 opacity-40 text-xs">Nenhuma conversa iniciada.</div>
                ) : (
                    conversations.map(conv => (
                        <ListItem 
                            key={conv.id}
                            id={conv.id}
                            name={conv.title}
                            isActive={activeConversationId === conv.id}
                            isEditing={editingConvId === conv.id}
                            editName={editConvName}
                            onSelect={() => { onSelectConversation(conv.id); onCloseMobile(); }}
                            onStartEdit={() => startEditConv(conv.id, conv.title)}
                            onEditChange={setEditConvName}
                            onSaveEdit={saveEditConv}
                            onKeyDown={handleConvKeyDown}
                            onDelete={() => onDeleteConversation(conv.id)}
                            theme={theme}
                            icon={<path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.375.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />}
                            inputRef={convInputRef}
                        />
                    ))
                )}
            </div>

            {/* Footer - User Profile & Settings */}
            <div className={`p-4 border-t flex flex-col gap-3 ${theme.isDark ? 'border-white/5 bg-black/20' : 'border-black/5 bg-white/40'}`}>
                
                {/* Theme Selector */}
                <div className="relative w-full">
                    {isThemeSelectorOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsThemeSelectorOpen(false)}></div>
                            <ThemeSelector currentTheme={theme} onSelect={(id) => onThemeChange(id)} onClose={() => setIsThemeSelectorOpen(false)} align="left" direction="up"/>
                        </>
                    )}
                    <button onClick={() => setIsThemeSelectorOpen(!isThemeSelectorOpen)} className={`p-2 rounded-lg transition-colors flex items-center gap-2 w-full px-3 ${theme.isDark ? 'hover:bg-white/10 text-white/70 hover:text-white' : 'hover:bg-black/5 text-slate-600 hover:text-black'}`}>
                        <div className={`w-4 h-4 rounded-full border shadow-sm relative overflow-hidden flex-shrink-0 ${theme.colors.bg.replace('bg-', 'bg-')}`} style={{ borderColor: 'currentColor' }}><div className={`absolute inset-0 opacity-50 ${theme.colors.orb1}`}></div></div>
                        <span className="text-xs font-medium">Tema</span>
                    </button>
                </div>

                {/* User Section (Replaces old Persona button which is now an icon inside) */}
                <div className={`flex items-center justify-between p-2 rounded-xl border ${theme.isDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                   <div className="flex items-center gap-2 overflow-hidden">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${theme.isDark ? 'bg-indigo-500 text-white' : 'bg-indigo-200 text-indigo-900'}`}>
                           {userInitials}
                       </div>
                       <div className="flex flex-col truncate">
                           <span className={`text-xs font-medium truncate ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>{currentUser?.name || 'Usuário'}</span>
                       </div>
                   </div>
                   
                   <div className="flex items-center">
                        {/* Settings Button */}
                        <button 
                            onClick={onOpenSettings} 
                            className={`p-1.5 rounded-lg transition-colors ${theme.isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-black hover:bg-black/5'}`}
                            title="Persona do Projeto"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 018.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.43.816 1.035.816 1.73 0 .695-.321 1.3-.816 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg>
                        </button>
                        
                        {/* Logout Button */}
                        <button 
                            onClick={onLogout}
                            className={`p-1.5 rounded-lg transition-colors ${theme.isDark ? 'text-white/40 hover:text-red-400 hover:bg-white/10' : 'text-slate-400 hover:text-red-600 hover:bg-black/5'}`}
                            title="Sair"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                        </button>
                   </div>
                </div>

            </div>
        </div>
      </div>
    </>
  );
};

const ListItem: React.FC<any> = ({ id, name, isActive, isEditing, editName, onSelect, onStartEdit, onEditChange, onSaveEdit, onKeyDown, onDelete, theme, icon, inputRef }) => (
    <div 
        className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${isActive ? (theme.isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black') : (theme.isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-black/5 hover:text-black')}`}
        onClick={isEditing ? undefined : onSelect}
    >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0 opacity-70">
            {icon}
        </svg>
        <div className="flex-1 truncate text-sm font-light relative">
            {isEditing ? (
                <input ref={inputRef} type="text" value={editName} onChange={(e) => onEditChange(e.target.value)} onBlur={onSaveEdit} onKeyDown={onKeyDown} onClick={(e) => e.stopPropagation()} className={`w-full bg-transparent border-b ${theme.isDark ? 'border-white/50 text-white' : 'border-black/50 text-black'} focus:outline-none p-0 h-5`} />
            ) : name}
        </div>
        {!isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onStartEdit(); }} className="p-1.5 rounded-md hover:bg-indigo-500/20 hover:text-indigo-500"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-md hover:bg-red-500/20 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button>
            </div>
        )}
    </div>
);

export default Sidebar;
