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

export const generateQuery = (knowledge: string, userQuery: string) => {
    return `Based on this knowledge: ${knowledge ? knowledge : "no relevant knowledge"} 
    Please answer the question: ${userQuery}
    If you base on the knowledge that have strict answer, please answer with the provided strict answer text.
    Follow this format: ***{"answer": "<your answer based on the provided knowledge>"}***`;
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
            const knowledgeText = knowledgeFormat(knowledge);
            return generateQuery(knowledgeText, message);
        case "submit":
            const userInfo = username ? await userInfos(username) : "";
            return submitTicket(userInfo, message);
        default:
            const defaultKnowledgeText = knowledgeFormat(knowledge);
            return generateQuery(defaultKnowledgeText, message);
    }
}