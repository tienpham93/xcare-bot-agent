


export const extractSubString = (string: string, regex: RegExp): any => {
    const match = string.match(regex);
    if (match && match[1]) {
        const jsonString = match[1]
            .replace(/True/g, 'true')
            .replace(/'/g, '"');
        return JSON.parse(jsonString);
    }
    return null;
}

export const getPreviousMessage = (conversationId: string, conversations: Map<string, any>): string | null => {
    const messages = conversations.get(conversationId);
    if (messages && messages.length > 0) {
        return messages[messages.length - 1];
    }
    return null;
}

export const getLastBotMessage = (conversation: { role: string, content: string }[]): string | null => {
    for (let i = conversation.length - 1; i >= 0; i--) {
        if (conversation[i].role === 'bot') {
            return conversation[i].content;
        }
    }
    return null;
}