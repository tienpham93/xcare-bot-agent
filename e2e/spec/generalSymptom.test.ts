import { expect } from '@playwright/test';
import { test as base } from '@playwright/test';
import { ApiFixture } from '../fixtures/Login.fixture';

const test = base.extend<{ apiHelper: ApiFixture }>({
    apiHelper: async ({ request }, use) => {
        const apiHelper = new ApiFixture(request);
        await apiHelper.getLoginData('tienpham', 'tienpham');
    },
});

test('Low symptoms', async ({ apiHelper }) => {

    const payload = {
        prompt: 'I am having a headache, what should I do?',
        messageType: 'general',
    };
    const botResponse = await apiHelper.agentGenerate(payload);

    console.log('====>>>', botResponse);
    expect(botResponse).toContain('drink water');
});
