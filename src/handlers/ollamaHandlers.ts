import { Request, Response } from 'express';
import { OllamaResponse } from '../types';
import { logger } from '../utils/logger';
import { ollamaService, answerRulesNLP, internalDataNLP } from '../server';

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

    const relevantInternalData = await internalDataNLP.search(prompt);
    const answerRules = await answerRulesNLP.search(relevantInternalData);

    try {
        if (model) {
            ollamaService.setModel(model);
        }

        if (!conversations.has(conversationId)) {
            conversations.set(conversationId, []);
        }

        const conversation = conversations.get(conversationId)!;
        
        const inputContent = relevantInternalData 
            ? `Based on these knowledges: ${relevantInternalData.replace(/\r\n/g, '')}
            and these answer rules: ${answerRules ? answerRules?.replace(/\r\n/g, '') : 'No relevant rules'}
            Please answer the question: ${prompt} with this format: 
            ***{'isInternalData': true, 'isAnswerRules': ${answerRules ? true : false}, 'answer': <answer based on internal data and answer rules>}***`
            : `Please answer the user's question: ${prompt}
            With this format: ***{'isInternalData':false, 'isAnswerRules': false, 'answer':<answer based on your knowledges>}***`;
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