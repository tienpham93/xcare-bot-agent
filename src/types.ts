
export interface ChatMessage {
    role: "user" | "bot";
    content: string;
}

export interface ChatResponse {
    success: boolean;
    response?: string;
    error?: string;    
}

export interface ModelConfig { 
    name: string;
    parameters: {
        temperature: number;
        top_p: number;
        num_predict: number;
    };
}

export interface OllamaChatRequest {
    model: string;
    messages: ChatMessage[];
    stream?: boolean;
    temperature: number;
    top_p: number;
    num_predict: number;
}

export interface OllamaGenerateRequest {
    model: string;
    stream?: boolean;
    prompt: string;
}

export interface OllamaResponse {
    model: string;
    message: {
        role: string;
        content: string;
    };
    metadata?: {
        topic?: string;
        intent?: string;
        sessionData?: Record<string, any>;
    };
}

export enum MatchType {
    KEYWORD = 'keyword',
    SEMANTIC = 'semantic'
}

export interface InternalData {
    topics: string[];
    content: string;
    keywords: string[];
}

export interface MatchResult {
    data: InternalData;
    score: number;
    matchType: MatchType;
}

export interface Conversation {
    topic: string;
    messages: ChatMessage[];
    metatdata?: Record<string, any>;
}

export interface ConversationState {
    topic: string;
    name: string;
    transitions: {
        [key: string]: string; // intent -> next state
    };
    handler: (context: ConversationContext) => Promise<SearchResult[]>;
}

export interface ConversationContext {
    currentState: string;
    intent: string;
    entities: Record<string, any>;
    sessionData: Record<string, any>;
}

export interface Knowledge {
    topic: string;
    content: string;
    category: string;
    embedding?: number[];
    metadata?: Record<string, any>;
}

export interface SearchResult {
    content: string;
    similarity: number;
    metatdata?: Record<string, any>;
}