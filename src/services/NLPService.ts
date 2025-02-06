import natural from 'natural';
import { Document } from '@langchain/core/documents';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';
import * as stopWords from 'stopword';
import { SearchResult } from '../types';

export class NLPSearchEngine {

    private documents: Document[] = [];
    private tfidf: natural.TfIdf;
    private tokenizer: natural.WordTokenizer;
    private stemmer: natural.Stemmer;
    private classifier: natural.BayesClassifier;
    public matchedTopic: string;

    constructor() {
        this.tfidf = new natural.TfIdf();
        this.tokenizer = new natural.WordTokenizer();
        this.stemmer = natural.PorterStemmer;
        this.classifier = new natural.BayesClassifier();
        this.documents = [];
        this.matchedTopic = '';
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

    public async loadDocuments(results: SearchResult[]): Promise<Document[]> {
        const documents: Document[] = [];
        try {
            for (const result of results) {
                result.content
                const doc = new Document({
                    pageContent: result.content,
                    metadata: {
                        topic: result.topic,
                        category: result.category
                    }
                });
                documents.push(doc);
            }
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
        console.log(`NLP scores:`, searchResults);

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

        this.matchedTopic = highestResult.label;
        return this.matchedTopic;
    }

    public async getAllPageContent(): Promise<string> {
        const matchedContent = this.documents.map(doc => doc.pageContent);
        return matchedContent.join('\n');
    }

}