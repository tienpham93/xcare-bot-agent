import { OllamaService } from './ollamaService';
import { logger } from './utils/logger';
import express from 'express';
import router from './router';
import { ollamaPort, expressPort } from './env';

const app = express();
export const ollamaService = new OllamaService(`http://127.0.0.1:${ollamaPort}`);

app.use(express.json());

// Initialize the model
(async () => {
    try {
        await ollamaService.initialize();
        logger.info('Ollama service initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize Ollama service:', error);
        process.exit(1);
    }
})();

app.use(router);
app.listen(expressPort, () => {    
    logger.info(`Express is running at http://localhost:${expressPort}`);
    logger.info(`Model ${ollamaService.modelConfig.name} is running at http://localhost:${ollamaPort}`);
});