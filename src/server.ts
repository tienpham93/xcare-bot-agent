import { OllamaService } from './services/ollamaService';
import { logger } from './utils/logger';
import express from 'express';
import router from './router';
import { ollamaPort, expressPort } from './constants/env';
import { NLPSearchEngine } from './services/NLPService';

const app = express();
const ollamaHost = `http://127.0.0.1:${ollamaPort}`;

export const ollamaService = new OllamaService(ollamaHost);
export const nlpInstance = new NLPSearchEngine();

app.use(express.json());

// Initialize the agent
(async () => {
    try {
        await ollamaService.initialize();

        const data = await nlpInstance.loadDocuments('./src/data');
        await nlpInstance.ingestDocuments(data);

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