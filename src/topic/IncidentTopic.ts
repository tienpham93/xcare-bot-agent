import { DataSources } from "../types";
import { BaseTopic, optionalAnswerRules, optionalKnowledges } from "./baseTopic";

export class IncidentTopic extends BaseTopic {

    public optionalTopic: string[];

    constructor(dataSources: DataSources) {
        super(dataSources);
        this.primaryTopic = 'incident topic';
        this.optionalTopic = ['contacts topic', 'billing topic'];
    }

    public async getIncidentKnowledges(): Promise<string> {
        this.knowledges = await this.getKnowledges(this.primaryTopic);
        return this.knowledges;
    }

    public async getincidentAnswerRules(): Promise<string> {
        this.answerRules = await this.getAnswerRules(this.primaryTopic);
        return this.answerRules;
    }

    public async incidentPrimaryPrompt(userMessage: string): Promise<string> {        
        const knowledges = await this.getIncidentKnowledges();
        const rules = await this.getincidentAnswerRules();

        this.optionalTopic.forEach(async (optTopic: string) => {
            await this.appendOptionalKnowledges(optTopic);
            await this.appendOptionalAnswerRules(optTopic);
        });

        return `Based on internal knowledges: ${knowledges} and these answer rules: ${rules}
        Please answer this question: ${userMessage} 
        Anwser following this format: ***<your answer based on match knowledges>***`
    }


}