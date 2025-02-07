import { ollamaService } from "../server";
import { ConversationContext, ConversationState, SearchResult } from "../types";
import { logger } from "../utils/logger";
import { KnowledgeBase } from "./RAGservice/knowledgeBase";

let nextKnowledgeList: SearchResult[] | null;
let previousKnowledgeList: SearchResult[] | null;

export class ConversationStateManager {
    public states: Map<string, ConversationState> = new Map();
    public sessions: Map<string, ConversationContext> = new Map();
    private currentKnowledge: SearchResult[] = [];

    constructor(private knowledgeBase: KnowledgeBase) {
        this.initializeStates();
    }

    private initializeStates() {
        // Define states
        const states: ConversationState[] = [
            {
                name: 'initial',
                topic: 'initial',
                transitions: {
                    '*': 'general_questions'
                },
                handler: async (context) => {
                    const knowledge = await this.knowledgeBase.searchKnowledgeByTopic(context.currentState, 1);
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
                currentState: 'initial',
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

        // Retrieve relevant knowledge
        previousKnowledgeList = this.currentKnowledge;

        // Retrieve relevant knowledge
        let relevantData = await this.knowledgeBase.searchRelevant(prompt);
        this.currentKnowledge = relevantData ?? [];

        // Retrieve next topic knowledge
        const nextTopicList: string[] = [];
        relevantData?.forEach((result) => {
            const nextTopic = result.metadata?.nextTopic ? result.metadata?.nextTopic : '';
            if (nextTopic && !nextTopicList.includes(nextTopic)) {
                nextTopicList.push(nextTopic);
            }
        });

        // Merge relevant knowledge with previous knowledge
        if (previousKnowledgeList) {
            relevantData = relevantData ? [...relevantData, ...previousKnowledgeList] : previousKnowledgeList;

            // Remove duplicates
            const uniqueData = new Map();
            relevantData.forEach(item => uniqueData.set(item.content, item));
        
            relevantData = Array.from(uniqueData.values());
            logger.info('Merged relevant knowledge with previous knowledge');
        }

        // Merge relevant knowledge with next topic knowledge
        try {
            if (nextKnowledgeList) {
                relevantData = relevantData ? [...relevantData, ...nextKnowledgeList] : nextKnowledgeList;

                // Remove duplicates
                const uniqueData = new Map();
                relevantData.forEach(item => uniqueData.set(item.content, item));
            
                relevantData = Array.from(uniqueData.values());
            }

            if (nextTopicList.length == 0) {
                nextKnowledgeList = [];
            }
            logger.info('Merged relevant knowledge with next topic knowledge');
        } catch (error) {
            logger.error('Failed to merge relevant knowledge with next topic knowledge:', error);
        }

        // Update session data with relevant knowledge
        context.sessionData.knowledge = relevantData;

        // Generate response based on corresponding knowledge
        const response = await ollamaService.generate(prompt, relevantData);
        context.sessionData.completePrompt = response.completePrompt;

        nextTopicList.forEach(async (topic) => {
            nextKnowledgeList = await this.knowledgeBase.searchKnowledgeByTopic(topic, 1);
        });

        // Transition to next state
        // const nextStateTopic = currentState.transitions[intent] || currentState.transitions['*'];
        // if (nextStateTopic) {
        //     context.currentState = nextStateTopic;
        // }

        // Clean up knowledge
        relevantData = [];
        previousKnowledgeList = [];

        return {
            currentStateName: currentStateName,
            response: response.response
        };
    }

}