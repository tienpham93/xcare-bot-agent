import { OllamaService } from './services/ollamaService';
import { logger } from './utils/logger';
import express from 'express';
import router from './router';
import { ollamaPort, expressPort } from './env';
import { VectorDB } from './services/vectorDB';

const app = express();
const ollamaHost = `http://127.0.0.1:${ollamaPort}`;
const vectorDBpath = `./faiss_store`;

export const ollamaService = new OllamaService(ollamaHost);
export const vectorDB = new VectorDB(ollamaService.modelConfig.name, ollamaService.baseUrl);

app.use(express.json());

// Initialize the agent
(async () => {
    try {
        await ollamaService.initialize();
        const internalData = await vectorDB.loadDocuments('./src/data');
        await vectorDB.ingestData(internalData);
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
    logger.info(`Vector DB is ${vectorDBpath}`);
});