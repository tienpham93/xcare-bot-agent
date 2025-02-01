import { OllamaService } from './services/ollamaService';
import { logger } from './utils/logger';
import express from 'express';
import router from './router';
import { ollamaPort, expressPort } from './constants/env';
import { VectorStore } from './services/vectorStore';

const app = express();
const ollamaHost = `http://127.0.0.1:${ollamaPort}`;

export const ollamaService = new OllamaService(ollamaHost);
export const internalDataStore = new VectorStore(ollamaService.modelConfig.name, ollamaService.baseUrl);
export const answerStore = new VectorStore(ollamaService.modelConfig.name, ollamaService.baseUrl);

app.use(express.json());

// Initialize the agent
(async () => {
    try {
        await ollamaService.initialize();

        const internalData = await internalDataStore.loadDocuments('./src/data');
        await internalDataStore.ingestData(internalData, 'internalData_store');

        const answerRulesData = await answerStore.loadDocuments('./src/answerRules');
        await answerStore.ingestData(answerRulesData, 'answer_store');

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