
import { expect, type APIRequestContext } from '@playwright/test';
import { GeneratePayload } from '../types';

export class ApiFixture {
    public bearerToken: string = '';
    public userMetadata: any = {};
    public request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;

    }

    public async getLoginData(username: string, password: string) {
        const response = await this.request.post('/agent/login', {
            data: {
                username: username,
                password: password
            }
        });

        const responseBody = await response.json();
        this.bearerToken = `Bearer ${responseBody.token}`;
        this.userMetadata = responseBody.userMetadata;
    }

    public async agentGenerate(payload: GeneratePayload) {
        const response = await this.request.post('/agent/generate', {
            headers: {
                'content-type': 'application/json',
                'Authorization': this.bearerToken
            },
            data: {
                username: payload.username || this.userMetadata.username,
                messageType: payload.messageType || 'general',
                sessionId: payload.sessionId,
                model: payload.model || 'x-care-uncle',
                prompt: payload.prompt
            }
        });

        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        return responseBody.conversation.message[1].content;
    }

}