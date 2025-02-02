import natural from 'natural';
import { Document } from '@langchain/core/documents';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';
import * as stopWords from 'stopword';

export class NLPSearchEngine {

    private documents: Document[] = [];
    private tfidf: natural.TfIdf;
    private tokenizer: natural.WordTokenizer;
    private stemmer: natural.Stemmer;
    private classifier: natural.BayesClassifier;

    constructor() {
        this.tfidf = new natural.TfIdf();
        this.tokenizer = new natural.WordTokenizer();
        this.stemmer = natural.PorterStemmer;
        this.classifier = new natural.BayesClassifier();
        this.documents = [];
    }

    private async preprocessText(text: string): Promise<string> {
        let processed = text.toLowerCase();
        const tokens = this.tokenizer.tokenize(processed);
        if (!tokens) {
            return text;
        }
        const filteredTokens = stopWords.removeStopwords(tokens);
        const stemmedTokens = filteredTokens.map(token => this.stemmer.stem(token));
        return stemmedTokens.join(' ');
    }

    public async ingestDocuments(documents: Document[]): Promise<void> {
        this.documents = documents;

        // Process and add documents to TF-IDF
        for (const doc of documents) {
            const processedText = await this.preprocessText(doc.pageContent);
            this.tfidf.addDocument(processedText);

            // Train the classifier with the document
            this.classifier.addDocument(processedText, doc.metadata?.topic || 'unknown');
        }

        // Start the training process
        this.classifier.train();
    }

    public async loadDocuments(directoryPath: string): Promise<Document[]> {
        const documents: Document[] = [];
        try {
            const files = await fs.readdir(directoryPath);
            const txtFiles = files.filter(file => file.endsWith('.txt'));

            for (const file of txtFiles) {
                const filePath = path.join(directoryPath, file);
                const content = await fs.readFile(filePath, 'utf-8');
                const doc = new Document({
                    pageContent: content,
                    metadata: {
                        source: filePath,
                        filename: path.basename(file),
                        topic: path.basename(file, '.txt')
                    }
                });
                documents.push(doc);
            }
            logger.info(`Loaded documents from ${directoryPath} successfully`);
            return documents;
        } catch (error) {
            logger.error('Failed to load documents:', error);
            throw error;
        }
    }

    public async search(query: string): Promise<string> {
        const processedQuery = await this.preprocessText(query);
        const queryTerms = this.tokenizer.tokenize(processedQuery) || [];

        const searchResults = this.classifier.getClassifications(queryTerms);
        console.log(`searchResults:`, searchResults);

        let highestResult = { label: '', value: 0 };

        // If all results are the same then return an empty string
        if (searchResults.every(result => result.value === searchResults[0].value)) {
            return '';
        }

        // Find the highest result that is above a certain threshold
        for (const result of searchResults) {
            if (result.value >= 0.2 && result.value > highestResult.value) {
                highestResult = result;
            }
        }

        // If no relevance then return an empty string
        if (!highestResult.label) {
            return '';
        }

        const matchedContent = this.documents.filter(doc => doc.metadata?.topic === highestResult.label);
        return matchedContent.map(doc => doc.pageContent).join('\n');
    }

}