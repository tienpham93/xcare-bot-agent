import { Request, Response } from 'express';
import { OllamaResponse } from '../types';
import { logger } from '../utils/logger';
import { ollamaService, vectorDB } from '../server';
import { medicalTypePrompt } from '../prompts/healthCare';

// Initialize conversation history
const conversations: Map<string, any> = new Map();

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

        const chatResponse = await ollamaService.chat(conversation);
        let botResponse: OllamaResponse = {
            model: model,
            message: {
                role: 'bot',
                content: chatResponse
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

export const postGenerateHandler = async (
    req: Request, 
    res: Response
) => {
    const { model, prompt, conversationId = 'default' } = req.body;
    const relevantInternalData = await vectorDB.getRelevantContext(prompt);
    try {
        if (model) {
            ollamaService.setModel(model);
        }

        if (!conversations.has(conversationId)) {
            conversations.set(conversationId, []);
        }

        const conversation = conversations.get(conversationId)!;
        const inputContent = relevantInternalData 
            ? medicalTypePrompt(prompt, relevantInternalData)
            : prompt;
        conversation.push({ role: 'user', content: inputContent });

        const generatedResponse = await ollamaService.generate(inputContent);
        let botResponse: OllamaResponse = {
            model: model,
            message: {
                role: 'bot',
                content: generatedResponse.response
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
        logger.error('Failed to prompt:', error);
        res.status(500).json({ error: 'Failed to prompt' });
    };
};