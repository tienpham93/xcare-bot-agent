import { InternalData, MatchResult } from "../types";
import { MatchType } from "../types";


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

    // private async findSemanticMatches(question: string): Promise<MatchResult[]> {
    //     const analysisPrompt = `Analyzing this question ${question} 
    //     to see if there are any semantic matches to this dataset:
    //     ${this.internalData.map((data, index) => `[${index}] - content: ${data.content}`).join('\n')}`;
    //     try {
    //         const response = await fetch('http://localhost:5000/analyze', {
    //     } catch (error) {
            
    //     }

    // }


}