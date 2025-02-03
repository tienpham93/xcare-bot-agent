import { Request, Response } from 'express';
import { OllamaResponse } from '../types';
import { logger } from '../utils/logger';
import { ollamaService } from '../server';
import { topicResolver } from '../topic/topicResolver';

// Initialize conversation history
const conversations: Map<string, any> = new Map();

export const postGenerateHandler = async (
    req: Request,
    res: Response
) => {
    const { model, prompt, conversationId = 'default' } = req.body;
    const { inputContent, metadata } = await topicResolver(prompt);

    try {
        if (model) {
            ollamaService.setModel(model);
        }

        if (!conversations.has(conversationId)) {
            conversations.set(conversationId, []);
        }

        const conversation = conversations.get(conversationId)!;

        conversation.push({ role: 'user', content: inputContent });

        const generatedResponse = await ollamaService.generate(inputContent);

        let botResponse: OllamaResponse = {
            model: model,
            message: {
                role: 'bot',
                content: generatedResponse.response,
            },
            metadata: metadata,
            done: true
        }

        if (botResponse.done) {
            conversation.push({
                role: 'bot',
                content: botResponse.message.content!,
                metadata: botResponse.metadata
            });
            res.json({
                conversationId: conversationId,
                conversation: conversation
            });
        }

    } catch (error) {
        logger.error('Failed to prompt:', error);
        res.status(500).json({ error: 'Failed to prompt' });
    };
};