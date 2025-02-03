import { NLPSearchEngine } from "../services/NLPService";
import { DataSources } from "../types";

export let optionalKnowledges = '';
export let optionalAnswerRules = '';

export class BaseTopic {

    public knowledgesInstance: NLPSearchEngine;
    public answerRulesInstance: NLPSearchEngine;
    public knowledges: string;
    public answerRules: string;

    public sources: DataSources;
    public primaryTopic: string;

    constructor(dataSources: DataSources) {
        this.knowledgesInstance = new NLPSearchEngine();
        this.answerRulesInstance = new NLPSearchEngine();
        this.knowledges = '';
        this.answerRules = '';

        this.sources = dataSources;
        this.primaryTopic = '';
    }

    public async getMetadata(): Promise<any> {
        return {
            topic: this.primaryTopic,
            isInternalKnowledges: this.knowledges ? true : false,
            isAnswerRules: this.answerRules ? true : false
        }
    }

    public async getKnowledges(topic: string): Promise<string> {
        const data = await this.knowledgesInstance.loadDocuments(this.sources.knowledges);
        await this.knowledgesInstance.ingestDocuments(data);

        return await this.knowledgesInstance.search(topic);
    }

    public async getAnswerRules(topic: string): Promise<string> {
        const sources = this.sources.answerRules ? this.sources.answerRules : '';
        const data = await this.answerRulesInstance.loadDocuments(sources);
        await this.answerRulesInstance.ingestDocuments(data);

        return await this.answerRulesInstance.search(topic);
    }

    public async appendOptionalKnowledges(topic: string): Promise<void> {
        const knowledges = await this.getKnowledges(topic);
        if (!optionalKnowledges.includes(knowledges)) {
            optionalKnowledges = optionalKnowledges + knowledges;
        }
    }

    public async appendOptionalAnswerRules(topic: string): Promise<void> {
        const rules = await this.getAnswerRules(topic);
        if (!optionalAnswerRules.includes(rules)) {
            optionalAnswerRules = optionalAnswerRules + rules; 
        }
    }

    public async clearOptionalKnowledges(): Promise<void> {
        optionalKnowledges = '';
    }

    public async clearOptionalAnswerRules(): Promise<void> {
        optionalAnswerRules = '';
    }

}