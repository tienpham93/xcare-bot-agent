import { test } from '../fixtures/fixtureConfig';

const medical_package_list = [
    {
        testName: 'Ask for Adolescent Package infos',
        prompt: 'I am 18 years old, what medical package I can buy?',
        expect: ['Adolescent Package']
    },
    {
        testName: 'Ask for Under30 Package infos',
        prompt: 'My wife is 29 years old, what medical package I can buy for her?',
        expect: ['Under30 Package']
    },
    {
        testName: 'Ask for Middle Age Package infos',
        prompt: 'I will be 35 years old in the next 3 year, what medical package for me at that time?',
        expect: ['Middle Age Package']
    },
    {
        testName: 'Ask for Senior Package infos',
        prompt: 'Can I buy a Senior package for my dad, he is 60 years old?',
        expect: ['yes']
    }
];

medical_package_list.forEach(({ testName, prompt, expect }) => {
    test(testName, async ({ apiFixture, customExpect }) => {
        const payload = {
            prompt: prompt,
            messageType: 'general',
        };
        const botResponse = await apiFixture.agentGenerate(payload);
        test.info().annotations.push({ type: 'User query', description: payload.prompt });

        customExpect(botResponse).includeOneOfTheseValues(expect);
    });

});

test('Ask for medical package price', async ({ apiFixture, customExpect }) => {
    const payload = {
        prompt: 'How much does the Senior Package cost?',
        messageType: 'general',
    };
    const botResponse = await apiFixture.agentGenerate(payload);
    test.info().annotations.push({ type: 'User query', description: payload.prompt });

    const expectPrice = ['$1000'];

    customExpect(botResponse).includeOneOfTheseValues(expectPrice);
});

test('Ask for where to see all of medical package infos', async ({ apiFixture, customExpect }) => {
    const payload = {
        prompt: 'How can I review all of medical package infos?',
        messageType: 'general',
    };
    const botResponse = await apiFixture.agentGenerate(payload);
    test.info().annotations.push({ type: 'User query', description: payload.prompt });

    const expectSite = ['www.xcare.com'];

    customExpect(botResponse).includeOneOfTheseValues(expectSite);
});