import { dataSources } from "../constants/env";
import { nlpInstance } from "../server";
import { optionalKnowledges, optionalAnswerRules, BaseTopic } from "./baseTopic";
import { ContactsTopic } from "./contactsTopic";
import { IncidentTopic } from "./IncidentTopic";

const topicChains: any[] = [];

export const topicResolver = async (prompt: string,): Promise<any> => {
    let inputContent: string;
    let metadata = {
        topic: '',
        isInternalKnowledges: optionalKnowledges ? true : false,
        isAnswerRules: optionalAnswerRules ? true : false,
    };

    const defaultInputContent = `Based on this internal knowledges: ${optionalKnowledges ? optionalKnowledges : "no data"} And these answer rules: ${optionalAnswerRules ? optionalAnswerRules : "no rules"} Please answer the question: ${prompt} following this format: ***<matched knowledges if none anwser question based on your knowledges>***`;

    await nlpInstance.search(prompt);
    const topic = new BaseTopic(dataSources);

    let previousTopic = topicChains[topicChains.length - 1]
    const incidentTopic = new IncidentTopic(dataSources);
    const contactsTopic = new ContactsTopic(dataSources);

    topicChains.push(nlpInstance.matchedTopic);
    console.log(`====>>>>`, prompt);
    console.log(`====>>>>`, topicChains);
    switch (nlpInstance.matchedTopic) {
        case 'incident':
            inputContent = await incidentTopic.incidentPrimaryPrompt(prompt);
            metadata = await incidentTopic.getMetadata();
            break;
        case 'contacts':
            inputContent = await contactsTopic.contactsPrimaryPrompt(prompt);
            metadata = await contactsTopic.getMetadata();
            break;
        case 'confirmation': 
            if (previousTopic === 'incident') {
                await contactsTopic.getContactsKnowledges();
                await contactsTopic.getContactsAnswerRules();
                inputContent = `Based on contacts knowledges: ${contactsTopic.knowledges} and answer following this format: ***<your answer>***`;
            }
            else {
                inputContent = defaultInputContent;
            }
            break;            
        default:
            inputContent = defaultInputContent;
            break;
    }
    await topic.clearOptionalKnowledges();
    await topic.clearOptionalAnswerRules();

    return { inputContent, metadata };
}
