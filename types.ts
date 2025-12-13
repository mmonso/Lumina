
export enum Role {
  User = 'user',
  Model = 'model'
}

export interface Attachment {
  type: 'image' | 'audio';
  mimeType: string;
  data: string; // Base64 string (Data URL)
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
  searchEntryPoint?: {
    renderedContent: string;
  };
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  attachments?: Attachment[];
  isStreaming?: boolean;
  groundingMetadata?: GroundingMetadata | null;
  timestamp: number;
}

export interface ThemeConfig {
  id: string;
  name: string;
  isDark: boolean;
  colors: {
    bg: string;
    text: string;
    textMuted: string;
    accent: string;
    orb1: string;
    orb2: string;
    orb3: string;
    bubbleUser: string;
    bubbleModel: string;
    inputBg: string;
  }
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// User System
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string; // Optional URL or base64
}

// Hierarquia: Projeto -> Conversas -> Mensagens

export interface Project {
  id: string;
  userId: string; // Owner of the project
  name: string; 
  systemInstruction: string;
  themeId: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  projectId: string; // Link para o projeto pai
  title: string;
  updatedAt: number;
  preview?: string;
}
