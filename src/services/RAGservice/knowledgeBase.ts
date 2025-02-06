import { Knowledge, SearchResult } from "../../types";
import { logger } from "../../utils/logger";
import { BPEEmbeddingService } from "./BPEEmbeddingService";
import { VectorStore } from "./vectorStore";
import fs from 'fs';
import path from 'path';
import { MinHashEmbeddingService } from "./minHashEmbeddingService";
import { keywordsNLP } from "../../server";

export class KnowledgeBase {
    private static instance: KnowledgeBase;
    private vectorStore: VectorStore;
    private bpeEmbeddings: BPEEmbeddingService;
    private minhashEmbeddings: MinHashEmbeddingService;

    private localStorePath: string = path.join(process.cwd(), '/.faiss_store/documents.json');

    private constructor() {
        this.vectorStore = VectorStore.getInstance();
        this.bpeEmbeddings = new BPEEmbeddingService();
        this.minhashEmbeddings = new MinHashEmbeddingService();
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
                    topic: 'initial_greetings',
                    content: "hi, hi there, hi bot, hello, hey, what's up, good morning, good afternoon, good evening ...etc",
                    category: 'keywords',
                    metadata: {
                        strictAnswer: 'Hello! I am XCare uncle. How can I help you today?'
                    }
                }
            ];
            const allKnowledge = documents.concat(predefinedKnowledge);
            // Add predefined knowledge to the vector store
            const knowledgeWithEmbeddings = await Promise.all(
                allKnowledge.map(async (knowledge) => ({
                    ...knowledge,
                    embedding: await this.bpeEmbeddings.generateEmbedding(knowledge.content)
                }))
            );

            // Add all knowledge to the vector store
            await this.vectorStore.addDocuments(knowledgeWithEmbeddings);

            // Save the knowledge to local storage
            try {
                await fs.promises.mkdir(path.dirname(this.localStorePath), { recursive: true });
                await fs.promises.writeFile(this.localStorePath, JSON.stringify(knowledgeWithEmbeddings));
                logger.info('Saved the knowledge base to local storage');
            } catch (error) {
                logger.error('Failed to save the knowledge base to local storage:', error);
            }

            logger.info('Initialized the knowledge base');
        } catch (error) {
            logger.error('Failed to initialize the knowledge base:', error);
            throw error;
        }
    }

    public async searchRelevant(text: string): Promise<SearchResult[] | undefined> {
        const bpeQuery = await this.bpeEmbeddings.generateEmbedding(text);
        const bpeData = await this.vectorStore.search(bpeQuery, 15);

        // Filter all objects that have the category "keywords"
        const keywordCategoryObjects = bpeData.filter(obj => obj.category === "keywords");

        const minhashQuery = await this.minhashEmbeddings.generateEmbedding(text);
        const minhashData = await this.vectorStore.search(minhashQuery, 15);

        const keywords = await keywordsNLP.loadDocuments(keywordCategoryObjects);
        await keywordsNLP.ingestDocuments(keywords);
        const nlpMatchTopic = await keywordsNLP.search(text);

        // Find the object with the highest similarity
        const bpeHighestSimilarity = bpeData.reduce((prev, current) => (prev.similarity > current.similarity) ? prev : current);
        const minHashHighestSimilarity = minhashData.reduce((prev, current) => (prev.similarity > current.similarity) ? prev : current);
        console.log(`BPE highest: ${bpeHighestSimilarity.topic} score ${bpeHighestSimilarity.similarity}`);
        console.log(`MinHash highest: ${minHashHighestSimilarity.topic} score ${minHashHighestSimilarity.similarity}`);

        // If message contains any keyword in topic knowledge
        if (nlpMatchTopic) {
            return bpeData.filter(obj => obj.topic === nlpMatchTopic);
        }

        // Refer the highest of BPE over MinHash
        if (bpeHighestSimilarity > minHashHighestSimilarity) {
            return minhashData.filter(obj => obj.topic === bpeHighestSimilarity.topic);
        }

        // The highest from minhash embeddings
        return bpeData.filter(obj => obj.topic === minHashHighestSimilarity.topic);
    }

    public async searchKnowledgeByTopic(topic: string, k: number): Promise<SearchResult[] | null> {
        try {
            const documents = await fs.promises.readFile(this.localStorePath, 'utf-8');
            const jsonDocuments = JSON.parse(documents);
            const matchedDoc = jsonDocuments.find((doc: Knowledge) => doc.topic === topic);
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