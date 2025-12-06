import { GoogleGenAI, Chat, GenerateContentResponse, Content, Part, Tool } from "@google/genai";
import { Message, Role, Attachment, GroundingMetadata } from "../types";

const API_KEY = process.env.API_KEY || '';

class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;
  private abortController: AbortController | null = null;
  
  // Track current configuration to detect changes
  private currentSystemInstruction: string = '';
  private currentUseSearch: boolean = false;
  private currentHistory: Content[] = [];

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  // Initialize or reset the chat session
  public startChat(
    historyMessages: Message[] = [], 
    systemInstruction: string,
    useSearch: boolean = false
  ) {
    // Map internal Message format to Gemini's Content format
    const history: Content[] = historyMessages
      .filter(msg => (msg.text && msg.text.trim() !== '') || (msg.attachments && msg.attachments.length > 0)) 
      .map(msg => {
        const parts: Part[] = [];
        
        // Add text part
        if (msg.text) {
          parts.push({ text: msg.text });
        }

        // Add attachment parts
        if (msg.attachments) {
          msg.attachments.forEach(att => {
            // Strip data:mime;base64, prefix for API
            const base64Data = att.data.split(',')[1];
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: base64Data
              }
            });
          });
        }

        return {
          role: msg.role,
          parts: parts
        };
      });

    // Configure tools
    const tools: Tool[] = useSearch ? [{ googleSearch: {} }] : [];

    this.chatSession = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        tools: tools,
      },
      history: history
    });

    // Update state trackers
    this.currentSystemInstruction = systemInstruction;
    this.currentUseSearch = useSearch;
    this.currentHistory = history;
  }

  public abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  public async sendMessageStream(
    message: string, 
    attachments: Attachment[] = [],
    useSearch: boolean,
    onUpdate: (text: string, metadata?: GroundingMetadata) => void
  ): Promise<void> {
    
    // Check if we need to re-initialize due to configuration change
    if (!this.chatSession || this.currentUseSearch !== useSearch) {
        let existingHistory: Content[] = [];
        if (this.chatSession) {
            existingHistory = await this.chatSession.getHistory();
        }
        
        const tools: Tool[] = useSearch ? [{ googleSearch: {} }] : [];
        
        this.chatSession = this.ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: this.currentSystemInstruction,
                tools: tools
            },
            history: existingHistory
        });
        
        this.currentUseSearch = useSearch;
    }

    this.abortController = new AbortController();

    try {
      // Construct parts array
      const parts: Part[] = [];
      
      if (message) {
        parts.push({ text: message });
      }

      attachments.forEach(att => {
        const base64Data = att.data.split(',')[1];
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: base64Data
          }
        });
      });

      const content = parts.length === 1 && parts[0].text ? parts[0].text : parts;

      // Note: The current SDK might not fully support signal in sendMessageStream types yet, 
      // but we use the abort controller to break the loop client-side.
      const resultStream = await this.chatSession.sendMessageStream({ 
        message: content,
      });

      for await (const chunk of resultStream) {
        // Check abort signal manually inside loop
        if (this.abortController.signal.aborted) {
            break; 
        }

        const c = chunk as GenerateContentResponse;
        
        if (c.text) {
          let metadata: GroundingMetadata | undefined = undefined;
          
          if (c.candidates && c.candidates[0]?.groundingMetadata) {
             const gm = c.candidates[0].groundingMetadata;
             if (gm.groundingChunks) {
                 metadata = {
                     groundingChunks: gm.groundingChunks.map((chunk: any) => ({
                         web: chunk.web ? { uri: chunk.web.uri, title: chunk.web.title } : undefined
                     })),
                     searchEntryPoint: gm.searchEntryPoint ? { renderedContent: gm.searchEntryPoint.renderedContent } : undefined
                 };
             }
          }
          
          onUpdate(c.text, metadata);
        }
      }
    } catch (error: any) {
      if (this.abortController?.signal.aborted) {
        // Ignore abort errors
        return;
      }
      console.error("Error sending message to Gemini:", error);
      throw error;
    } finally {
      this.abortController = null;
    }
  }
}

export const geminiService = new GeminiService();