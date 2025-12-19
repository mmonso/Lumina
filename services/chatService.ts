import { supabase } from './supabaseClient';
import { Conversation, Message, Role } from '../types';

export const chatService = {

    // --- CONVERSATIONS ---

    fetchConversations: async (projectId: string): Promise<Conversation[]> => {
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('project_id', projectId)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return data.map(c => ({
            id: c.id,
            projectId: c.project_id,
            title: c.title,
            updatedAt: new Date(c.updated_at).getTime()
        }));
    },

    createConversation: async (projectId: string, title: string): Promise<Conversation> => {
        const { data, error } = await supabase
            .from('conversations')
            .insert({ project_id: projectId, title })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            projectId: data.project_id,
            title: data.title,
            updatedAt: new Date(data.updated_at).getTime()
        };
    },

    updateConversationTitle: async (id: string, title: string): Promise<void> => {
        const { error } = await supabase
            .from('conversations')
            .update({ title, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    },

    deleteConversation: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('conversations')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // --- MESSAGES ---

    fetchMessages: async (conversationId: string): Promise<Message[]> => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true }); // Mensagens em ordem cronológica

        if (error) throw error;

        return data.map(m => ({
            id: m.id,
            role: m.role as Role,
            text: m.text || '',
            attachments: m.attachments || [],
            groundingMetadata: m.grounding_metadata,
            timestamp: new Date(m.created_at).getTime()
        }));
    },

    // Salvar uma mensagem (User ou Model)
    saveMessage: async (conversationId: string, message: Message): Promise<Message> => {
        // Preparar objeto para insert (remover campos que não vão pro banco ou converter)
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                role: message.role,
                text: message.text,
                attachments: message.attachments,
                grounding_metadata: message.groundingMetadata
            })
            .select()
            .single();

        if (error) throw error;

        // Atualizar o 'updated_at' da conversa pai para ela subir na lista
        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);

        return {
            id: data.id,
            role: data.role as Role,
            text: data.text || '',
            attachments: data.attachments || [],
            groundingMetadata: data.grounding_metadata,
            timestamp: new Date(data.created_at).getTime()
        };
    }
};
