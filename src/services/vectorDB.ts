
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { Document } from '@langchain/core/documents';
import { OllamaEmbeddings } from '@langchain/ollama';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

export class VectorDB {
    private embedding: OllamaEmbeddings;
    private vectorStore: FaissStore | null;

    constructor(model: string, baseUrl: string) {
        this.vectorStore = null;
        this.embedding = new OllamaEmbeddings({
            model: model,
            baseUrl: baseUrl
        });
    }

    async ingestData(documents: Document[]) {
        try {
            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkOverlap: 200,
                chunkSize: 1000
            });

            const splits = await textSplitter.splitDocuments(documents);
            this.vectorStore = await FaissStore.fromDocuments(
                splits,
                this.embedding
            )
            await this.vectorStore.save('./faiss_store');
        } catch (error) {
            logger.error({ message: 'Failed to ingest data', error });
            throw error;
        }
    }

    async loadVectorStore() {
        try {
            this.vectorStore = await FaissStore.load(
                './faiss_store',
                this.embedding
            );
        } catch (error) {
            logger.error({ message: 'Failed to load vector store', error });
            throw error;
        }
    }

    async loadDocuments(directoryPath: string): Promise<Document[]> {
        const documents: Document[] = [];
        try {
            const files = fs.readdirSync(directoryPath);

            for (const file of files) {
                const filePath = path.join(directoryPath, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const jsonContent = JSON.parse(content);
                documents.push(new Document({
                    pageContent: JSON.stringify(jsonContent),
                    metadata: {
                        source: filePath,
                        fileName: file
                    }
                }));
            }
        } catch (error) {
            logger.error({ message: 'Failed to load documents', error });
            throw error;
        }
        return documents;
    }

    async getRelevantContext(query: string, k: number = 1) {
        if (!this.vectorStore) {
            throw new Error('Vector store not initialized');
        }

        const context = await this.vectorStore.similaritySearch(query, k);
        return context.map(doc => doc.pageContent).join('\n');
    }

}