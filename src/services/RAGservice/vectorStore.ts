import { IndexFlatL2 } from 'faiss-node';
import FaissNode from 'faiss-node';
import { Knowledge, SearchResult } from '../../types';
import { logger } from '../../utils/logger';
import fs from 'fs';
import path from 'path';

export class VectorStore {
    private static instance: VectorStore;
    private index: IndexFlatL2;
    public documents: Knowledge[] = [];
    public faiss_index_path: string = path.join(process.cwd(), 'faiss_store.idx');

    private constructor() {
        this.index = new FaissNode.IndexFlatL2(384);
        this.loadIndex();
    }

    private async loadIndex(): Promise<void> {
        try {
            await IndexFlatL2.read(this.faiss_index_path);
            logger.info(`Loaded Faiss index from ${this.faiss_index_path}`);
        } catch (error) {
            logger.error(`No existing index Faiss index: ${error}`);
        }
    }

    public static getInstance(): VectorStore {
        if (!VectorStore.instance) {
            VectorStore.instance = new VectorStore();
        }
        return VectorStore.instance;
    }

    public async addDocument(embedding: number[], document: Knowledge): Promise<void> {
        try {
            // Add to Faiss index
            const id = this.documents.length;
            await this.index.add(embedding);

            this.documents.push({
                ...document,
                embedding
            });

            logger.info(`Added document with ${id} to vector store`);

        } catch (error) {
            logger.error(`Failed to add document: ${error}`);
            throw error;
        }
    }

    public async addDocuments(documents: Knowledge[]): Promise<void> {
        try {
            // Add to Faiss index
            for (let i = 0; i < documents.length; i++) {
                await this.index.add(documents[i].embedding!);
                this.documents.push(documents[i]);
                logger.info(`Added ${documents[i].topic} - ${documents[i].category} to vector store`);
            }


            this.documents.push(...documents);

            logger.info(`Added ${documents.length} documents to vector store`);
        } catch (error) {
            logger.error(`Failed to add documents: ${error}`);
            throw error;
        }
    }

    public async search(query: number[], k: number): Promise<SearchResult[]> {
        try {
            // Search for the nearest neighbors
            const { distances, labels } = await this.index.search(query, k);

            // Retrieve the documents
            const results: SearchResult[] = labels.map((docIndex: number, i: number) => ({
                topic: this.documents[docIndex]?.topic ? this.documents[docIndex]?.topic : 'unknown',
                category: this.documents[docIndex]?.category ? this.documents[docIndex]?.category : 'unknown',
                content: this.documents[docIndex]?.content ? this.documents[docIndex]?.content : 'unknown',
                similarity: distances[i] ? (1 / (1 + distances[i])) : 0, // Convert distance to similarity score
                metadata: this.documents[docIndex]?.metadata ? this.documents[docIndex]?.metadata : {}
            }));

            return results;
        } catch (error) {
            logger.error(`Failed to search for documents: ${error}`);
            throw error;
        }
    }

    public async searchByTopic(topicDoc: Knowledge, k: number): Promise<SearchResult[]> {
        try {
            return this.search(topicDoc?.embedding!, k);
        } catch (error) {
            logger.error(`Failed to search for documents by topic: ${error}`);
            throw error;
        }
    }

    public async save(): Promise<void> {
        try {
            await this.index.write(this.faiss_index_path);
            logger.info(`Saved vector store to ${this.faiss_index_path}`);
        } catch (error) {
            logger.error(`Failed to save vector store: ${error}`);
            throw error;
        }
    }

    public async load(directoryPath: string): Promise<Knowledge[]> {
        try {
            // Load metadata
            const files = await fs.promises.readdir(directoryPath);
            const jsonFiles = files.filter(file => file.endsWith('.json'));
            let documents: Knowledge[] = [];
            for (const file of jsonFiles) {
                const filePath = path.join(directoryPath, file);
                const content = await fs.promises.readFile(filePath, 'utf-8');
                documents = documents.concat(JSON.parse(content));
            }

            logger.info(`Loaded vector store from ${directoryPath}`);
            return documents;
        } catch (error) {
            logger.error(`Failed to load vector store: ${error}`);
            throw error;
        }
    }


}