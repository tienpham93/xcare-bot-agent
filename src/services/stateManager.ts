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
                topic: 'greetings',
                transitions: {
                    'general_questions': 'general_questions',
                    '*': 'none'
                },
                handler: async (context) => {
                    const knowledge = await this.knowledgeBase.searchKnowledgeByTopic('greetings', 1);
                    return knowledge || [];
                }
            },
            {
                name: 'general questions',
                topic: 'general_questions',
                transitions: {
                    'general_questions': 'general_questions',
                    'general_symptoms': 'general_symptoms',
                    'medical_package': 'doc_referral',
                    'contact': 'contact',
                    'billing': 'billing',
                    '*': 'none'
                },
                handler: async (context) => {
                    const knowledge = await this.knowledgeBase.searchKnowledgeByTopic('general_questions', 1);
                    return knowledge || [];
                }
            },
            {
                name: 'general symptoms',
                topic: 'general_symptoms',
                transitions: {
                    'general_questions': 'general_questions',
                    'yes': 'doc_referral',
                    'no': 'general_comments',
                    'billing': 'billing',
                    '*': 'none'
                },
                handler: async (context) => {
                    const knowledge = await this.knowledgeBase.searchKnowledgeByTopic('general_symptoms', 1);
                    return knowledge || [];
                }
            },
            {
                name: 'none',
                topic: 'none',
                transitions: {
                    'general_questions': 'general_questions',
                    '*': 'none'
                },
                handler: async (context) => {
                    return [];
                }
            },
        ];

        states.forEach(state => this.states.set(state.name, state));
    }

    public async handleMessage(sessionId: string, message: string): Promise<string> {
        // Get or create session
        let context = this.sessions.get(sessionId);
        if (!context) {
            context = {
                currentState: 'greetings',
                intent: '',
                entities: {},
                sessionData: {}
            };
            this.sessions.set(sessionId, context);
        }        

        // Classify intent and extract entities
        const { intent, entities } = this.classifyIntent(message);
        context.intent = intent;
        context.entities = entities;

        // Get current state
        const currentState = this.states.get(context.currentState);
        if (!currentState) {
            throw new Error(`State ${context.currentState} not found`);
        }

        // Generate corresponding knowledge based on current state
        const currentKnowledge = await currentState.handler(context);
        context.sessionData.knowledge = currentKnowledge;

        // Generate response based on corresponding knowledge
        const response = await ollamaService.generate(currentKnowledge[0].content);

        // Transition to next state
        const nextStateTopic = currentState.transitions[intent] || currentState.transitions['*'];
        if (nextStateTopic) {
            context.currentState = nextStateTopic;
        }

        return response;
    }

    private classifyIntent(message: string): { intent: string, entities: any } {
        const normalizedMessage = message.toLowerCase().trim();

        // Confirmation intent
        if (normalizedMessage.includes('yes')) return { intent: 'yes', entities: {} };
        if (normalizedMessage.includes('no')) return { intent: 'no', entities: {} };

        // general_symptoms intent
        if (normalizedMessage.includes('symptom')) return { intent: 'general_symptoms', entities: {} };
        if (normalizedMessage.includes('headache')) return { intent: 'general_symptoms', entities: {} };

        // billing intent
        if (normalizedMessage.includes('how much')) return { intent: 'billing', entities: {} };

        // contact intent
        if (normalizedMessage.includes('contact')) return { intent: 'contact', entities: {} };
        if (normalizedMessage.includes('email')) return { intent: 'contact', entities: {} };
        if (normalizedMessage.includes('call')) return { intent: 'contact', entities: {} };

        // medical_package intent
        if (normalizedMessage.includes('medical package')) return { intent: 'medical_package', entities: {} };

        return { intent: '*', entities: {} };
    }

}