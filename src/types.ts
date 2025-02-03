
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
        topic: string | null;
        isInternalKnowledges: boolean;
        isAnswerRules: boolean;
    };
    done?: boolean;
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

export interface DataSources {
    knowledges: string;
    answerRules?: string;
    options?: string;
}