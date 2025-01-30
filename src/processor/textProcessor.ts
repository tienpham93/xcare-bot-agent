import { ollamaService } from "../server";
import { InternalData, MatchResult } from "../types";
import { MatchType } from "../types";
import { logger } from "../utils/logger";
import { extractObjectFromString } from "../utils/stringFormat";


class TextProcessor {
    private internalData: InternalData[];

    constructor(internalData: InternalData[]) {
        this.internalData = internalData;
    }

    async findRelevantData(question: string): Promise<InternalData[]> {
        return this.internalData;
    }

    private findKeywordMatches(question: string): Promise<MatchResult[]> {
        return new Promise(resolve => {
            const normalizedQuestion = question.toLowerCase();

            const matches = this.internalData
                .filter(data => data.keywords.some(keyword => normalizedQuestion.includes(keyword.toLowerCase())))
                .map(data => ({
                    data,
                    score: 1,
                    matchType: MatchType.KEYWORD
                }));
            resolve(matches);
        });
    }

    private async findSemanticMatches(question: string): Promise<any> {
        const analysisPrompt = `Please find relevant object from this data: ${this.internalData}
        For this question: 'My wife is now 50 years old, what type of medicine she should take?'.
        Please answer following this format: 
        ***{
            relevant: {
                'isMatch': boolean, 
                'matchContent': {
                    <return matched object, if none return null>
                }
            }
        }***`;
        try {
            const response = await ollamaService.chat([{ role: 'user', content: analysisPrompt }]);
            const matchResult = await extractObjectFromString(response);
            const matchContent = await matchResult.relevant.isMatch ? await matchResult.relevant.matchContent : null;
            return await matchContent;
        } catch (error) {
            logger.error('Failed to find semantic matches:', error);
        }

    }


}