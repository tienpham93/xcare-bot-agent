import { logger } from '../../utils/logger';

export class EmbeddingService {
    private readonly dimension: number = 384;
    private readonly numHashes: number = 384;
    private readonly prime: number = 4294967311;

    private generateHash(seed: number): (value: number) => number {
        return (value: number) => {
            let hash = value + seed * 2654435761;
            hash = Math.imul(hash ^ hash >>> 16, 2246822507);
            hash = Math.imul(hash ^ hash >>> 13, 3266489909);
            return (hash ^ hash >>> 16) >>> 0;
        }
    }

    async generateEmbedding(text: string): Promise<number[]> {
        try {
            // Convert text to shingles (character n-grams)
            const shingles = new Set<number>();
            const n = 3; // n-gram size

            for (let i = 0; i <= text.length - n; i++) {
                const shingle = text.slice(i, i + n);
                shingles.add(this.hashString(shingle));
            }

            // Generate minhash signatures
            const signature = new Array(this.numHashes);
            const shinglesArray = Array.from(shingles);

            for (let i = 0; i < this.numHashes; i++) {
                const hashFunc = this.generateHash(i);
                let minHash = Infinity;

                for (const shingle of shinglesArray) {
                    const hash = hashFunc(shingle) % this.prime;
                    minHash = Math.min(minHash, hash);
                }

                signature[i] = minHash / this.prime;    // Normalize to [0, 1]
            }

            return signature;
        } catch (error) {
            logger.error('Failed to generate embedding:', error);
            throw error;
        }
    }

    private hashString(value: string): number {
        let hash = 0;
        for (let i = 0; i < value.length; i++) {
            const char = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash >>> 0;
    }

    getDimension(): number {
        return this.dimension;
    }

}