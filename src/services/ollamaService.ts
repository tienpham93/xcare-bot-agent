import { ModelConfig, SearchResult } from "../types";
import { defautModelConfig, isValidModel } from "../config/modelConfig";
import { logger } from "../utils/logger";
import { exec } from "child_process";
import { OllamaGenerateRequest } from "../types";
import { promptGenerator } from "../prompt/promptFactory";
import { parseAnswer } from "../utils/stringFormat";
import { serverHost } from "../server";

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
            logger.info({ message: "Initialized model successfully" });
        } catch (error) {
            console.error(error);
        }
    }

    async generate(username: string, prompt: string, relevantResult?: SearchResult[] | null): Promise<any> {
        try {
            const completePrompt = await promptGenerator(
                "general",
                prompt, 
                relevantResult || [], 
                username
            );

            const requestBody: OllamaGenerateRequest = {
                model: this.modelConfig.name,
                stream: false,
                prompt: completePrompt
            };

            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Failed to response with: ${response.statusText}`);
            }
            const data = await response.json();
            return {
                response: data.response,
                completePrompt: completePrompt
            }
        } catch (error) {
            logger.error("Error when processing the response", error);
            throw error;
        }
    }

    async submitTicket(username: string, prompt: string, relevantResult?: SearchResult[] | null): Promise<any> {
        try {
            const completePrompt = await promptGenerator(
                "submit",
                prompt, 
                relevantResult || [], 
                username
            );

            const requestBody: OllamaGenerateRequest = {
                model: this.modelConfig.name,
                stream: false,
                prompt: completePrompt
            };
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Failed to response with: ${response.statusText}`);
            }
            const data = await response.json();

            const rawAnswer = parseAnswer(data.response);
            let responseAnswer = `***{ "answer": "You missed ${rawAnswer.data} please submit again follow this format title: <title> and content: <content>" }***`;
            if (rawAnswer.isValid) {
                const ticketData = await rawAnswer.data;
                const resSubmit = await fetch(`${serverHost}/agent/submit`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(await ticketData)
                });
                const resData = await resSubmit.json();
                responseAnswer = `***{ "answer": "Your ticket has been created successfully with ticket ID is ${resData.id}" }***`;
            }

            return {
                response: responseAnswer,
                completePrompt: completePrompt
            }
        } catch (error) {
            logger.error("Error when processing the response", error);
            throw error;
        }
    }

    setModel(modelName: string) {
        if (!isValidModel(modelName)) {
            throw new Error(`Invalid model name: ${modelName}`);
        }
        this.modelConfig.name = modelName;
    }

    setParameters(parameters: ModelConfig["parameters"]) {
        this.modelConfig.parameters = parameters;
    }

}
