import React, { useState, useRef, useEffect } from 'react';
import { ThemeConfig, Project } from '../types';
import ThemeSelector from './ThemeSelector';

interface DashboardProps {
  onNewProject: () => void;
  onSelectProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onDeleteProject: (id: string) => void;
  projects: Project[];
  theme: ThemeConfig;
  onThemeChange: (themeId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    onNewProject, 
    onSelectProject, 
    onRenameProject, 
    onDeleteProject, 
    projects, 
    theme, 
    onThemeChange 
}) => {
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  const textColor = theme.isDark ? 'text-white' : 'text-slate-800';

  useEffect(() => {
    if (editingProjectId && inputRef.current) {
        inputRef.current.focus();
    }
  }, [editingProjectId]);

  const startEditing = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setEditName(project.name);
  };

  const saveEdit = () => {
    if (editingProjectId && editName.trim()) {
        onRenameProject(editingProjectId, editName.trim());
    }
    setEditingProjectId(null);
  };

  const cancelEdit = () => {
    setEditingProjectId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm("Tem certeza que deseja excluir este projeto e todas as suas conversas?")) {
          onDeleteProject(id);
      }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-20 p-6 animate-fade-in-up relative overflow-y-auto">
      
      {/* Theme Selector (Fixed Bottom Center) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
          <div className="relative">
            {isThemeSelectorOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsThemeSelectorOpen(false)}></div>
                    <ThemeSelector currentTheme={theme} onSelect={onThemeChange} onClose={() => setIsThemeSelectorOpen(false)} align="center" direction="up" />
                </>
            )}
            <button onClick={() => setIsThemeSelectorOpen(!isThemeSelectorOpen)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-500 ${theme.isDark ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-black/5'} opacity-40 hover:opacity-100`}>
                <div className={`w-3 h-3 rounded-full border shadow-sm relative overflow-hidden ${theme.colors.bg.replace('bg-', 'bg-')}`} style={{ borderColor: 'currentColor' }}><div className={`absolute inset-0 opacity-50 ${theme.colors.orb1}`}></div></div>
                <span className="text-[10px] uppercase tracking-widest font-medium">Tema</span>
            </button>
        </div>
      </div>

      <div className="max-w-4xl w-full text-center space-y-12 pb-20">
        
        {/* Logo */}
        <div className="space-y-4">
          <div className="relative inline-block">
             <div className={`absolute -inset-4 rounded-full blur-3xl opacity-20 bg-${theme.colors.accent}-500 animate-pulse`}></div>
             <h1 className={`relative text-6xl md:text-8xl font-thin tracking-[0.2em] ${textColor} drop-shadow-2xl`}>LUMINA</h1>
          </div>
          <p className={`text-sm md:text-base tracking-[0.3em] uppercase opacity-70 ${textColor}`}>Gestão de Projetos & IA</p>
        </div>

        {/* Action Area */}
        <div className="flex flex-col items-center gap-6 w-full mx-auto">
          
          <button onClick={onNewProject} className={`w-full max-w-md group relative px-8 py-4 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] border shadow-2xl hover:shadow-${theme.colors.accent}-500/20 ${theme.isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/40 border-white/40 hover:bg-white/60'}`}>
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-${theme.colors.accent}-500 to-purple-500 transition-opacity`}></div>
            <div className="flex items-center justify-center gap-4">
              <span className={`p-2 rounded-lg bg-${theme.colors.accent}-500/20 text-${theme.colors.accent}-500 group-hover:text-white group-hover:bg-${theme.colors.accent}-500 transition-colors`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </span>
              <span className={`text-lg font-light tracking-wide ${textColor}`}>Criar Novo Projeto</span>
            </div>
          </button>

          {/* Project List Grid */}
          {projects.length > 0 && (
             <div className="w-full mt-8 animate-fade-in-up delay-100">
                 <div className={`text-[10px] uppercase tracking-widest mb-4 opacity-60 text-center ${textColor}`}>Seus Projetos</div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
                     {projects.map(project => (
                        <div
                            key={project.id}
                            onClick={() => editingProjectId !== project.id && onSelectProject(project.id)}
                            className={`group relative p-4 rounded-xl border transition-all hover:scale-[1.02] flex items-start gap-3 cursor-pointer ${theme.isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/50 border-black/5 hover:bg-white/80'}`}
                        >
                            <div className={`p-2 rounded-lg shrink-0 ${theme.isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
                            </div>
                            
                            <div className="min-w-0 flex-1">
                                {editingProjectId === project.id ? (
                                    <input 
                                        ref={inputRef}
                                        type="text" 
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onBlur={saveEdit}
                                        onKeyDown={handleKeyDown}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`w-full bg-transparent border-b ${theme.isDark ? 'border-white/50 text-white' : 'border-black/50 text-black'} focus:outline-none p-0 text-base font-medium`}
                                    />
                                ) : (
                                    <>
                                        <div className={`font-medium truncate ${textColor}`}>{project.name}</div>
                                        <div className={`text-xs opacity-60 truncate ${textColor}`}>{new Date(project.createdAt).toLocaleDateString()}</div>
                                    </>
                                )}
                            </div>

                            {/* Actions (Edit/Delete) - Only visible on hover and not editing */}
                            {editingProjectId !== project.id && (
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm rounded-lg p-1">
                                    <button 
                                        onClick={(e) => startEditing(e, project)} 
                                        className="p-1.5 rounded-md hover:bg-indigo-500 text-white/70 hover:text-white transition-colors"
                                        title="Renomear"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={(e) => handleDelete(e, project.id)} 
                                        className="p-1.5 rounded-md hover:bg-red-500 text-white/70 hover:text-white transition-colors"
                                        title="Excluir"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                     ))}
                 </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;