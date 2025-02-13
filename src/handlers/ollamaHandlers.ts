import { Request, Response } from 'express';
import { OllamaResponse } from '../types';
import { logger } from '../utils/logger';
import { ollamaService, serverHost, stateManager } from '../server';
import { AuthService } from '../services/authService';
import { parseAnswer } from '../utils/stringFormat';

export const postGenerateHandler = async (
    req: Request,
    res: Response
) => {
    const { model, prompt, sessionId = 'greeting', messageType, username } = req.body;
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

        const { currentStateName, response }  = await stateManager.handleMessage(sessionId, prompt, messageType, username);
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

        // Check if the bot response requires human intervention
        const rawAnswer = await parseAnswer(response);
        if (rawAnswer.isManIntervention) {
            logger.info('Bot request human intervention');
            await fetch(`${serverHost}/agent/monitoring`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    conversation: {
                        user: prompt,
                        bot: rawAnswer.answer
                    },
                    isManIntervention: rawAnswer.isManIntervention
                })
            });
        };

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