import { Request, Response } from 'express';
import { OllamaResponse } from '../types';
import { logger } from '../utils/logger';
import { ollamaService, stateManager } from '../server';
import { AuthService } from '../services/authService';

export const postGenerateHandler = async (
    req: Request,
    res: Response
) => {
    const { model, prompt, sessionId = 'greeting' } = req.body;

    // Verify Auth Token
    const authService = new AuthService();
    const authToken = req.headers.authorization;

    if (authToken) {
        authService.verifyTokenFromHeader(authToken);
    } else {
        logger.error('Unauthorized request');
        res.status(401).json({ error: 'Unauthorized request' });
        return;
    }

    // Handle Prompt
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