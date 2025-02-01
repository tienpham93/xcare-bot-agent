
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { OllamaEmbeddings } from '@langchain/ollama';
import { logger } from '../utils/logger';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import path from 'path';
import { topicKeywordList } from '../constants/keywords';

export class VectorStore {
    private embedding: OllamaEmbeddings;
    private vectorStore: FaissStore | null;
    public topicKeywords = topicKeywordList;

    constructor(model: string, baseUrl: string) {
        this.vectorStore = null;
        this.embedding = new OllamaEmbeddings({
            model: model,
            baseUrl: baseUrl
        });
    }

    async ingestData(documents: any, storeName: string) {
        try {
            this.vectorStore = await FaissStore.fromDocuments(
                documents,
                this.embedding
            )
            await this.vectorStore.save(`./${storeName}`);
            logger.info({ message: `Ingest data successfully for ${storeName}` });
        } catch (error) {
            logger.error({ message: 'Failed to ingest data', error });
            throw error;
        }
    }

    async detectQueryTopic(query: string) {
        const lowerQuery = query.toLowerCase();
        for (const [topic, keywords] of Object.entries(this.topicKeywords)) {
            if ((keywords as string[]).some((keyword: string) => lowerQuery.includes(keyword))) {
                return topic;
            }
        }
        return null;
    }

    async loadDocuments(directoryPath: string) {
        const fileName: string[] = [];
        const loader = new DirectoryLoader(directoryPath, {
            ".txt": (paths) => {
                fileName.push(path.basename(paths, '.txt'));
                return new TextLoader(paths)
            }
        });
        const docs = await loader.load();
        for (let i = 0; i < docs.length; i++) {
            docs[i].metadata.topic = fileName[i];
        }

        return docs;
    }

    async getRelevantContext(query: string, k: number = 10) {
        if (!this.vectorStore) {
            throw new Error('Vector store not initialized');
        }

        const context = await this.vectorStore.similaritySearch(query, k);
        const detectedTopic = await this.detectQueryTopic(query);
        if (detectedTopic) {
            const matchedContext = context.filter(doc => doc.metadata.topic === detectedTopic);
            return matchedContext.map(doc => doc.pageContent).join('\n');
        }
        return null;
    }

}