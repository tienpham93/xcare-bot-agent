import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { User, UserCredential } from '../types';
import path from 'path';

export class AuthService {
    private username: string;
    private password: string;
    private readonly jwtSecret = '11223355';
    private readonly jsonFilePath = path.join(process.cwd(), 'src/data/userData.json');

    constructor(username?: string, password?: string) {
        this.username = username || '';
        this.password = password || '';
    }

    private isValidCredential(): boolean {
        const data = fs.readFileSync(this.jsonFilePath, 'utf8');
        const users: User[] = JSON.parse(data);

        return users.some(user => user.credentials.username === this.username && user.credentials.password === this.password);
    }

    public createJwtToken(): string | null {
        if (this.isValidCredential()) {
            const payload = { username: this.username };
            return jwt.sign(payload, this.jwtSecret, { expiresIn: '15m' });
        }
        return null;
    }

    public verifyJwtToken(token: string): boolean {
        try {
            jwt.verify(token, this.jwtSecret);
            return true;
        } catch (error) {
            return false;
        }
    }

    public verifyTokenFromHeader(token: string): boolean {
        const bearerToken = token.split(' ')[1];
        return this.verifyJwtToken(bearerToken);
    }

    public getUserDataAndToken() {
        const data = fs.readFileSync(this.jsonFilePath, 'utf8');
        const users: User[] = JSON.parse(data);

        const userData = users.find(user => user.username === this.username);
        if (userData) {
            userData.credentials = {} as UserCredential;
        } else {
            throw new Error('User not found');
        }

        const token = this.createJwtToken();
        return {
            token: token,
            userMetadata: userData,
        }
    }

}