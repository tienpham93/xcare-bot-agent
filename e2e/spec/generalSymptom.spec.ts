import { expect } from '@playwright/test';
import { test as base } from '@playwright/test';
import { ApiFixture } from '../fixtures/Login.fixture';
import { containsExpectedValue } from '../utils/assertion.util';

const test = base.extend<{ apiHelper: ApiFixture }>({
    apiHelper: async ({ request }, use) => {
        const apiHelper = new ApiFixture(request);
        await apiHelper.getLoginData('tienpham', 'tienpham');
        await use(apiHelper);
    },
});

test('Ask for Low symptoms infos', async ({ apiHelper }) => {
    const payload = {
        prompt: 'I am having a headache, what should I do?',
        messageType: 'general',
    };
    const botResponse = await apiHelper.agentGenerate(payload);
    console.log('User query:', payload.prompt);
    console.log('Bot response:', botResponse);

    const expectedStayAtHome = ['stay home', 'staying home', 'treated at home'];
    const expectedDrinkWater = ['enough water', 'stay hydrated'];
    const expectedProvideVitamineC = ['vitamin C'];
    const expectedSleepWell = ['sleep well', 'sleeping well', 'plenty of sleep'];

    expect(containsExpectedValue(botResponse, expectedStayAtHome)).toBe(true);
    expect(containsExpectedValue(botResponse, expectedDrinkWater)).toBe(true);
    expect(containsExpectedValue(botResponse, expectedProvideVitamineC)).toBe(true);
    expect(containsExpectedValue(botResponse, expectedSleepWell)).toBe(true);
});

test('Ask for Low symptoms remains longer than 3 days', async ({ apiHelper }) => {
    const payload = {
        prompt: 'But the headache has been there for more than 3 days, and I am feeling dizzy',
        messageType: 'general',
    };
    const botResponse = await apiHelper.agentGenerate(payload);
    console.log('User query:', payload.prompt);
    console.log('Bot response:', botResponse);

    const expectedContactOnlineDoctor = ['XCare online doctors'];

    expect(containsExpectedValue(botResponse, expectedContactOnlineDoctor)).toBe(true);

});
