import { ChatMessage, ModelConfig, OllamaChatRequest } from "../types";
import { defautModelConfig, isValidModel } from "../config/modelConfig";
import { logger } from "../utils/logger";
import { exec } from "child_process";
import { OllamaGenerateRequest } from "../types";

export class OllamaService {
    public baseUrl: string;
    public modelConfig: ModelConfig;

    constructor(host: string) {
        this.baseUrl = host;
        this.modelConfig = defautModelConfig;
    }

    async initialize(modelName?: string) {
        try {
            const model = modelName && isValidModel(modelName) ? modelName : defautModelConfig.name;
            exec(`ollama serve`);
            this.modelConfig.name = model;
            logger.info({message: 'Initialized model successfully'});
        } catch (error) {
            console.error(error);
        }
    }

    async chat(messages: ChatMessage[]): Promise<any> {
        try {
            const requestBody: OllamaChatRequest = {   
                model: this.modelConfig.name,
                messages,
                ...this.modelConfig.parameters
            };

            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
    
            if (!response.ok) {
                throw new Error(`Failed to response with: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder('utf-8');
            let result = '';
            let done = false;
    
            while (!done) {
                const { value, done: streamDone } = await reader!.read();
                done = streamDone;
                result += decoder.decode(value, { stream: !done });
            }
    
            const lines = result.split('\n').filter(line => line.trim() !== '');
            const parsedObjects = lines.map(line => JSON.parse(line));
            const fullText = parsedObjects.reduce((acc, obj) => acc + obj.message.content, '');

            return fullText;
        } catch (error) {
            logger.error('Error when processing the response', error);
            throw error;
        }
    }

    async generate(prompt: string, knowledge?: string): Promise<any> {
        try {
            const completePrompt = `Based on this knowledge: ${knowledge ? knowledge : 'no relevant knowledge'} Please answer the question: ${prompt}`;

            const requestBody: OllamaGenerateRequest = {   
                model: this.modelConfig.name,
                stream: false,
                prompt: completePrompt
            };

            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
    
            if (!response.ok) {
                throw new Error(`Failed to response with: ${response.statusText}`);
            }
            const data = await response.json();
            return data.response;
        } catch (error) {
            logger.error('Error when processing the response', error);
            throw error;
        }
    }

    setModel(modelName: string) {
        if (!isValidModel(modelName)) {
            throw new Error(`Invalid model name: ${modelName}`);
        }
        this.modelConfig.name = modelName;
    }

    setParameters(parameters: ModelConfig['parameters']) {
        this.modelConfig.parameters = parameters;
    }

}
