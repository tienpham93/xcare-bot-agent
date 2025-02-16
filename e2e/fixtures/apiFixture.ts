
import { expect, type APIRequestContext } from '@playwright/test';
import { GeneratePayload } from '../types';

export class ApiFixture {
    public bearerToken: string = '';
    public userMetadata: any = {};
    public request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;

    }

    public async setBearerToken(token: string) {
        this.bearerToken = token;
    }

    public async getLoginData(username: string, password: string): Promise<any> {
        const response = await this.request.post('/agent/login', {
            data: {
                username: username,
                password: password
            }
        });

        const responseBody = await response.json();
        return {
            token: responseBody.token,
            userMetadata: responseBody.userMetadata
        };
    }

    public async agentGenerate(payload: GeneratePayload) {
        const response = await this.request.post('/agent/generate', {
            headers: {
                'content-type': 'application/json',
                'Authorization': this.bearerToken
            },
            data: {
                username: payload.username || this.userMetadata.username,
                messageType: payload.messageType,
                sessionId: payload.sessionId,
                model: payload.model || '',
                prompt: payload.prompt
            }
        });
        const responseBody = await response.json();

        if(!response.ok()) {
            return responseBody.error;
        }
        return responseBody.conversation.message[1].content;
    }

}