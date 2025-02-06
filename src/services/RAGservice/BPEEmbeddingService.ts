import { logger } from "../../utils/logger";


export class BPEEmbeddingService {
    private readonly dimension: number = 384;
    private readonly vocabSize: number = 10000;
    private readonly maxTokens: number = 512;
    private readonly specialTokens = {
        PAD: '[PAD]',
        UNK: '[UNK]',
        CLS: '[CLS]',
        SEP: '[SEP]',
    };
    private readonly contextWindow: number = 8;

    async generateEmbedding(text: string): Promise<number[]> {
        try {
            // Initialize embedding vector
            const embedding = new Float32Array(this.dimension).fill(0);

            // Normalize and tokenize text
            const normalizedText = this.normalizeText(text);
            const tokens = this.tokenize(normalizedText);

            // Generate feature using positional encoding
            for (let i = 0; i < tokens.length && i < this.maxTokens; i++) {
                const token = tokens[i];
                const tokenFeatures = this.getTokenFeatures(token, i);

                // Add token features to the embedding vector
                for (let j = 0; j < this.dimension; j++) {
                    embedding[j] += tokenFeatures[j];
                }
            }

            // Normalize the final embedding vector
            const normalizedEmbedding = this.normalizeVector(embedding);

            // Ensure we return exactly the dimension elements
            return Array.from(normalizedEmbedding).slice(0, this.dimension);
        } catch (error) {
            logger.error('Failed to generate embedding:', error);
            throw error;
        }
      
    }

    private normalizeText(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    private tokenize(text: string): string[] {
        // Simple whitespace tokenization with subword units
        const words = text.split(' ');
        const tokens: string[] = [];
        for (const word of words) {
            if (word.length <= 3) {
                tokens.push(word);
            } else {
                // Create subword units
                for (let i = 0; i < word.length - 2; i++) {
                    tokens.push(word.slice(i, i + 3));
                }
            }
        }
        // Add special tokens
        tokens.unshift(this.specialTokens.CLS);
        tokens.push(this.specialTokens.SEP);
        return tokens;
    }

    private getTokenFeatures(token: string, position: number): Float32Array {
        const features = new Float32Array(this.dimension).fill(0);
        // Hash the token to get a consistent starting position
        const hash = this.hashString(token);
        const start = hash %  (this.dimension / 4);
        // Generate positional encoding features
        for (let i = 0; i < 4; i++) {
            const pos = (start + i*(this.dimension / 4)) % this.dimension;
            features[pos] = Math.sin(position / (10000 ** (2 * i / this.dimension)));
            if (pos + 1 < this.dimension) {
                features[pos + 1] = Math.cos(position / (10000 ** (2 * i / this.dimension)));
            }
        }
        return features;
    }
    
    private hashString(value: string): number {
        let hash = 0;
        for (let i = 0; i < value.length; i++) {
            const char = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    private normalizeVector(vector: Float32Array): Float32Array {
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        if (magnitude === 0) {
            return new Float32Array(this.dimension).fill(1 / Math.sqrt(this.dimension));
        }
        return new Float32Array(vector.map(val => val / magnitude));
    }

    getDimension(): number {
        return this.dimension;
    }
}