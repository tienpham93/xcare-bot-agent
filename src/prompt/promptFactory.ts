import { serverHost } from "../server";
import { SearchResult, User } from "../types"

const userInfos = async (username: string) => {
    const response = await fetch(`${serverHost}/agent/user?username=${username}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await response.json() as unknown as User;
    return `username: ${data.username},
        gender: ${data.gender},
        age: ${data.age},
        email: ${data.email}`;
};

const knowledgeFormat = (relevantResult?: SearchResult[] | null) => {
    let knowledge: any[] = [];

    relevantResult?.forEach((result) => {
        let content = result.content;
        let strictAnswer = result.metadata?.strictAnswer ? result.metadata?.strictAnswer : "";
        knowledge.push(`[content:${content}.${strictAnswer ? `Must reply by this text: ${strictAnswer}` : ""}]`);
    });

    return knowledge.join("");
}

const isManIntervention = (knowledge: SearchResult[]) => {
    let isManIntervention = false;
    knowledge.forEach((result) => {
        if (result.metadata?.isManIntervention) {
            isManIntervention = true;
        }
    });

    return isManIntervention;
}

export const generateQuery = (knowledge: string, userQuery: string, isIntervention?: boolean) => {
    return `Based on this knowledge: ${knowledge ? knowledge : "no relevant knowledge"} 
    Please answer the question: ${userQuery}
    Follow this format: ***{"answer": "<your answer based on the provided knowledge>", "isManIntervention": ${isIntervention ? true : false}}***
    Answer rules: 
    1. If you choose the knowledge that have strict answer, please answer with the provided strict answer text.
    2. If you don't know the answer, please stritly follow this format: ***{"answer": "your query is out of my knowledge, please wait for a minute! I am connecting you to service desk team", "isManIntervention": true}***`;
};

export const submitTicket = (userInfos: string, userQuery: string) => {
    return `Please pick out these value: title, content, username, email
    From user message: ${userQuery}
    and user infos: ${userInfos}
    Please return as this format: ***{"isValid": true, "data": {"title":"<title>","content":"<content>","createdBy":"<username>","email":"<email>"}}***
    If any missing Please return: ***{"isValid": false, "data": "<missing value>"}***`;
}

export const promptGenerator = async (messageType: string, message: string, knowledge: SearchResult[], username?: string) => {
    switch (messageType) {
        case "general":
            const isIntervention = isManIntervention(knowledge);
            const knowledgeText = knowledgeFormat(knowledge);
            return generateQuery(knowledgeText, message, isIntervention);
        case "submit":
            const userInfo = username ? await userInfos(username) : "";
            return submitTicket(userInfo, message);
        default:
            const defaultKnowledgeText = knowledgeFormat(knowledge);
            return generateQuery(defaultKnowledgeText, message);
    }
}