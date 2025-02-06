import { ollamaService } from "../server";
import { ConversationContext, ConversationState, SearchResult } from "../types";
import { KnowledgeBase } from "./RAGservice/knowledgeBase";

export class ConversationStateManager {
    public states: Map<string, ConversationState> = new Map();
    public sessions: Map<string, ConversationContext> = new Map();
    
    constructor (private knowledgeBase: KnowledgeBase) {
        this.initializeStates();
    }

    private initializeStates() {
        // Define states
        const states: ConversationState[] = [
            {
                name: 'initial greetings',
                topic: 'initial_greetings',
                transitions: {
                    'general_questions': 'general_questions'
                },
                handler: async (context) => {
                    const knowledge = await this.knowledgeBase.searchKnowledgeByTopic(context.currentState, 10);
                    return knowledge || [];
                }
            }
        ];

        states.forEach(state => this.states.set(state.topic, state));
    }

    public async handleMessage(sessionId: string, prompt: string): Promise<any> {
        // Get or create session
        let context = this.sessions.get(sessionId);
        if (!context) {
            context = {
                currentState: 'initial_greetings',
                sessionData: {}
            };
            this.sessions.set(sessionId, context);
        }

        this.knowledgeBase.searchKnowledgeByTopic

        // Get current state
        const currentState = this.states.get(context.currentState);
        const currentStateName = currentState?.topic || 'none';
        if (!currentState) {
            throw new Error(`State ${context.currentState} not found`);
        }

        const relevantData = await this.knowledgeBase.searchRelevant(prompt)
        
        // Update session data with relevant knowledge
        context.sessionData.knowledge = relevantData;

        // Generate response based on corresponding knowledge
        const response = await ollamaService.generate(prompt, relevantData);
        context.sessionData.completePrompt = response.completePrompt;


        return {
            currentStateName: currentStateName,
            response: response.response
        };
    }

}