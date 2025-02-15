import { test } from '../fixtures/fixtureConfig';

test('Submit tickets', async ({ apiFixture, customExpect }) => {
    const payload = {
        prompt: `I would like to submit a ticket with title: Unreasonable charged for medicine bill and content: I've got a surcharge when brought 2 pairs of pain killer on Jan 20`,
        messageType: 'submit',
    };
    const botResponse = await apiFixture.agentGenerate(payload);
    test.info().annotations.push({ type: 'User query', description: payload.prompt });

    const expectPrice = ['Your ticket has been created successfully'];

    customExpect(botResponse).includeOneOfTheseValues(expectPrice);
});