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

        const { currentStateName, response }  = await stateManager.handleMessage(sessionId, prompt);
        const sessionMetadata = stateManager.sessions.get(sessionId);

        let metadata = {
            currentState: currentStateName,
            sessionData: sessionMetadata?.sessionData
        };

        let botResponse: OllamaResponse = {
            model: model,
            message: [
                {
                    role: 'user', 
                    content: prompt 
                }, { 
                    role: 'bot', 
                    content: response
                }
            ],
            metadata: {
                currentState: metadata?.currentState,
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