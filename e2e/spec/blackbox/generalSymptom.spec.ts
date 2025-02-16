import { test } from '../../fixtures/fixtureConfig';

test('Ask for Low symptoms infos', async ({ apiFixture, customExpect }) => {
    const payload = {
        prompt: 'I am having a headache, what should I do?',
        messageType: 'general',
    };
    const botResponse = await apiFixture.agentGenerate(payload);
    test.info().annotations.push({ type: 'User query', description: payload.prompt });

    const expectStayAtHome = ['stay home', 'staying home', 'treated at home'];
    const expectDrinkWater = ['enough water', 'stay hydrated'];
    const expectProvideVitamineC = ['vitamin C'];
    const expectSleepWell = ['sleep well', 'sleeping well', 'plenty of sleep', 'good sleep'];

    customExpect(botResponse).includeOneOfTheseValues(expectStayAtHome);
    customExpect(botResponse).includeOneOfTheseValues(expectDrinkWater);
    customExpect(botResponse).includeOneOfTheseValues(expectProvideVitamineC);
    customExpect(botResponse).includeOneOfTheseValues(expectSleepWell);
});

test('Ask for Low symptoms remains longer than 3 days', async ({ apiFixture, customExpect }) => {
    const payload = {
        prompt: 'But the headache has been there for more than 3 days, and I am feeling dizzy',
        messageType: 'general',
    };
    const botResponse = await apiFixture.agentGenerate(payload);
    test.info().annotations.push({ type: 'User query', description: payload.prompt });

    const expectedContactOnlineDoctor = ['XCare online doctors', 'online doctors', 'XCare hotline (1900 1234)'];

    customExpect(botResponse).includeOneOfTheseValues(expectedContactOnlineDoctor);
});

test('Ask for critical symptoms infos', async ({ apiFixture, customExpect }) => {
    const payload = {
        prompt: 'my arm has just broken, what should I do?',
        messageType: 'general',
    };
    const botResponse = await apiFixture.agentGenerate(payload);
    test.info().annotations.push({ type: 'User query', description: payload.prompt });

    const expectOnlineDoctor = ['XCare online doctors', 'our online doctors'];
    const expectNearCentre = ['nearest medical centre', 'nearby medical centre', 'nearby medical center', 'nearest medical center'];

    customExpect(botResponse).includeOneOfTheseValues(expectOnlineDoctor);
    customExpect(botResponse).includeOneOfTheseValues(expectNearCentre);
});
