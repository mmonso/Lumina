import { supabase } from './supabaseClient';
import { Project } from '../types';

export const projectService = {

    // Listar projetos do usuário logado
    fetchProjects: async (): Promise<Project[]> => {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(p => ({
            id: p.id,
            userId: p.user_id,
            name: p.name,
            systemInstruction: p.system_instruction || '',
            themeId: p.theme_id || 'ocean',
            createdAt: new Date(p.created_at).getTime()
        }));
    },

    // Criar novo projeto
    createProject: async (name: string, instruction: string, themeId: string): Promise<Project | null> => {
        // Pegar ID do user atual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data, error } = await supabase
            .from('projects')
            .insert({
                user_id: user.id,
                name,
                system_instruction: instruction,
                theme_id: themeId
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            userId: data.user_id,
            name: data.name,
            systemInstruction: data.system_instruction || '',
            themeId: data.theme_id,
            createdAt: new Date(data.created_at).getTime()
        };
    },

    // Atualizar projeto (instrução ou tema)
    updateProject: async (id: string, updates: Partial<Project>): Promise<void> => {
        // Mapear campos camelCase para snake_case
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.systemInstruction !== undefined) dbUpdates.system_instruction = updates.systemInstruction;
        if (updates.themeId !== undefined) dbUpdates.theme_id = updates.themeId;

        const { error } = await supabase
            .from('projects')
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;
    },

    // Excluir projeto
    deleteProject: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
