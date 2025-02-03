import { DataSources } from "../types";
import { BaseTopic } from "./baseTopic";

export class ContactsTopic extends BaseTopic {

    public optionalTopic: string[];

    constructor(dataSources: DataSources) {
        super(dataSources);
        this.primaryTopic = 'contacts topic';
        this.optionalTopic = ['billing topic'];
    }

    public async getContactsKnowledges(): Promise<string> {
        this.knowledges = await this.getKnowledges(this.primaryTopic);
        return this.knowledges;
    }

    public async getContactsAnswerRules(): Promise<string> {
        this.answerRules = await this.getAnswerRules(this.primaryTopic);
        return this.answerRules;
    }

    public async contactsPrimaryPrompt(userMessage: string): Promise<string> {
        const knowledges = await this.getContactsKnowledges();
        const rules = await this.getContactsAnswerRules();

        this.optionalTopic.forEach(async (optTopic: string) => {
            await this.appendOptionalKnowledges(optTopic);
            await this.appendOptionalAnswerRules(optTopic);
        });

        return `Based on internal knowledges: ${knowledges} and these answer rules: ${rules}
        Please answer the question: ${userMessage} following this format: ***<matched knowledges>***`
    }
}