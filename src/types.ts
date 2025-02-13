
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

export interface Message {
    role: string;
    content: string;
}

export interface OllamaResponse {
    model: string;
    message: Message[];
    metadata?: {
        currentState?: string;
        nextState?: string
        intent?: string;
        sessionData?: {};
    };
}

export interface InternalData {
    topics: string[];
    content: string;
    keywords: string[];
}

export interface Conversation {
    topic: string;
    messages: ChatMessage[];
    metadata?: Record<string, any>;
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
    sessionData: Record<string, any>;
}

export interface Knowledge {
    topic: string;
    content: string;
    category: string;
    embedding?: number[];
    metadata?: {
        strictAnswer?: string;
    }
}

export interface SearchResult {
    topic: string;
    category: string;
    content: string;
    similarity: number;
    metadata?: {
        strictAnswer?: string;
        nextTopic?: string;
        isManIntervention?: boolean;
    };
}

export interface User {
    id: string;
    fullname: string;
    username: string;
    gender: string;
    age: string;
    email: string;
    user_type: string;
    credentials: UserCredential;
}

export interface UserCredential {
    username: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface Ticket {
    id: string;
    title: string;
    content: string;
    createdBy: string;
    createdDate: Date;
    status: 'Completed' | 'Inprogress' | 'Open' | 'Closed';
}