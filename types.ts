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

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ThemeConfig {
  id: string;
  name: string;
  isDark: boolean;
  colors: {
    bg: string;      // Tailwind class for main background
    text: string;    // Tailwind class for primary text
    textMuted: string; // Tailwind class for secondary text
    accent: string;  // Hex or class for specific accents
    orb1: string;    // Tailwind class for blob 1
    orb2: string;    // Tailwind class for blob 2
    orb3: string;    // Tailwind class for blob 3
    bubbleUser: string; // Styling for user bubble
    bubbleModel: string; // Styling for model bubble
    inputBg: string; // Styling for input area
  }
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}