import { Knowledge, SearchResult } from "../../types";
import { logger } from "../../utils/logger";
import { EmbeddingService } from "./BPEEmbeddingService";
import { VectorStore } from "./vectorStore";


export class KnowledgeBase {
    private static instance: KnowledgeBase;
    private vectorStore: VectorStore;
    private embeddings: EmbeddingService;

    private constructor() {
        this.vectorStore = VectorStore.getInstance();
        this.embeddings = new EmbeddingService();
    }

    public static getInstance(): KnowledgeBase {
        if (!KnowledgeBase.instance) {
            KnowledgeBase.instance = new KnowledgeBase();
        }
        return KnowledgeBase.instance;
    }

    public async initializeKnowledgeBase(sourcePath: string): Promise<void> {
        try {
            const documents = await this.vectorStore.load(sourcePath);
            const predefinedKnowledge: Knowledge[] = [
                {
                    topic: 'greeting',
                    content: 'Hello! I am XCare uncle. How can I help you today?',
                    category: 'greeting',
                    metadata: {
                        priority: 1
                    }
                }
            ];
            const allKnowledge = documents.concat(predefinedKnowledge);
            // Add predefined knowledge to the vector store
            const knowledgeWithEmbeddings = await Promise.all(
                allKnowledge.map(async (knowledge) => ({
                    ...knowledge,
                    embedding: await this.embeddings.generateEmbedding(knowledge.content)
                }))
            );

            // Add all knowledge to the vector store
            await this.vectorStore.addDocuments(knowledgeWithEmbeddings);

            logger.info('Initialized the knowledge base');
        } catch (error) {
            logger.error('Failed to initialize the knowledge base:', error);
            throw error;
        }
    }

    public async searchKnowledgeByTopic(topic: string, k: number): Promise<SearchResult[] | null> {
        try {

            const matchedDoc = this.vectorStore.documents.find(doc => doc.topic === topic);
            if (!matchedDoc) {
                logger.error(`No document found with topic: ${topic}`);
                return null;
            }

            const results = await this.vectorStore.searchByTopic(matchedDoc, k);
            return results;
        } catch (error) {
            logger.error('Failed to search knowledge by topic:', error);
            throw error;
        }
    }

}