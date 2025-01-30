


export const extractObjectFromString = (input: string): any => {
    const regex = /\*\*\*(.*?)\*\*\*/s;
    const match = input.match(regex);
    if (match && match[1]) {
        const jsonString = match[1]
            .replace(/True/g, 'true')
            .replace(/'/g, '"');
        return JSON.parse(jsonString);
    }
    return null;
}