import { OllamaService } from './services/ollamaService';
import { logger } from './utils/logger';
import express from 'express';
import router from './router';
import { ollamaPort, expressPort } from './constants/env';
import { KnowledgeBase } from './services/RAGservice/knowledgeBase';
import { ConversationStateManager } from './services/stateManager';
import { NLPSearchEngine } from './services/NLPService';

const app = express();
const ollamaHost = `http://127.0.0.1:${ollamaPort}`;

export const ollamaService = new OllamaService(ollamaHost);

export const knowledgeBase = KnowledgeBase.getInstance();
export const keywordsNLP = new NLPSearchEngine();
export let stateManager: ConversationStateManager;

app.use(express.json());

// Initialize the agent
(async () => {
    try {
        await ollamaService.initialize();
        await knowledgeBase.initializeKnowledgeBase('./src/data');
        stateManager = new ConversationStateManager(knowledgeBase);

        logger.info('The Agent initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize the Agent:', error);
        process.exit(1);
    }
})();

app.use(router);
app.listen(expressPort, () => {    
    logger.info(`Express is running at http://localhost:${expressPort}`);
    logger.info(`Model ${ollamaService.modelConfig.name} is running at http://localhost:${ollamaPort}`);
});