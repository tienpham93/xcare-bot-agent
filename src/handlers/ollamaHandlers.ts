import { Request, Response } from 'express';
import { OllamaResponse } from '../types';
import { logger } from '../utils/logger';
import { ollamaService, stateManager } from '../server';

export const postGenerateHandler = async (
    req: Request,
    res: Response
) => {
    const { model, prompt, sessionId = 'greeting' } = req.body;
    try {
        if (model) {
            ollamaService.setModel(model);
        }

        const response = await stateManager.handleMessage(sessionId, prompt);
        const sessionMetadata = stateManager.sessions.get(sessionId);

        let metadata = {
            topic: sessionMetadata?.currentState,
            intent: sessionMetadata?.intent,
            sessionData: sessionMetadata?.sessionData
        };

        let botResponse: OllamaResponse = {
            model: model,
            message: {
                role: 'bot',
                content: response,
            },
            metadata: {
                topic: metadata?.topic,
                intent: metadata?.intent,
                sessionData: metadata?.sessionData
            },
        }

        logger.info('Bot response:', botResponse);
        res.json({
            sessionId: sessionId,
            conversation: botResponse
        });

    } catch (error) {
        logger.error('Failed to prompt:', error);
        res.status(500).json({ error: 'Failed to prompt' });
    };
};