import { Request, Response } from 'express';
import { ChatMessage, OllamaResponse } from '../types';
import { logger } from '../utils/logger';
import { ollamaService } from '../server';

// Initialize conversation history
const conversations: Map<string, ChatMessage[]> = new Map();

export const postChatHandler = async (
    req: Request, 
    res: Response
) => {
    const { message, conversationId = 'default', model } = req.body;
    try {
        if (model) {
            ollamaService.setModel(model);
        }
        if (!conversations.has(conversationId)) {
            conversations.set(conversationId, []);
        }

        const conversation = conversations.get(conversationId)!;
        conversation.push({ role: 'user', content: message });

        const response = await ollamaService.chat(conversation);
        let botResponse: OllamaResponse = {
            model: model,
            message: {
                role: 'bot',
                content: response
            },
            done: true
        }

        if (botResponse.done) {
            conversation.push({ role: 'bot', content: botResponse.message.content! });
            res.json({ 
                conversationId: conversationId,
                conversation: conversation 
            });
        }

    } catch (error) {
        logger.error('Failed to chat:', error);
        res.status(500).json({ error: 'Failed to chat' });
    };
};