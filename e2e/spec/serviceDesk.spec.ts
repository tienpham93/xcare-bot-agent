import { test } from '../fixtures/fixtureConfig';

const service_desk_list = [
    {
        testName: 'Raise an incident',
        prompt: 'I want to report an incident',
        expectResponse: ['Please wait for awhile! A technician will assist you shortly'],
        expectFlagOn: [`"isManIntervention": true`]
    },
    {
        testName: 'Raise an urgent issue',
        prompt: 'I want to report an urgent issue',
        expectResponse: ['Please wait for awhile! A technician will assist you shortly'],
        expectFlagOn: [`"isManIntervention": true`]
    },
]

service_desk_list.forEach(({ testName, prompt, expectResponse, expectFlagOn }) => {
    test(testName, async ({ apiFixture, customExpect }) => {
        const payload = {
            prompt: prompt,
            messageType: 'general',
        };
        const botResponse = await apiFixture.agentGenerate(payload);
        test.info().annotations.push({ type: 'User query', description: payload.prompt });

        customExpect(botResponse).includeOneOfTheseValues(expectResponse);
        customExpect(botResponse).includeOneOfTheseValues(expectFlagOn);
    });

});