import { test, expect } from '../../../fixtures/fixtureConfig';

test('Verify generate successfully with VALID Bearer token', async ({ rawApiFixture }) => {
    const payload = {
        "username": "tienpham",
        "messageType": "general",
        "sessionId": "111",
        "model": "x-care-uncle",
        "prompt": "I am having a headache, what should I do?"
    }
    const authen = await rawApiFixture.getLoginData('tienpham', 'tienpham');
    await rawApiFixture.setBearerToken(authen.token);

    const botResponse = await rawApiFixture.agentGenerate(payload);
    expect(botResponse).not.toBeNull();
});

test('Verify generate unsuccessfully with INVALID Bearer token', async ({ rawApiFixture }) => {
    const payload = {
        "username": "tienpham",
        "messageType": "general",
        "sessionId": "24234",
        "model": "x-care-uncle",
        "prompt": "I am having a headache, what should I do?"
    }

    await rawApiFixture.setBearerToken('Invalid token');

    const botResponse = await rawApiFixture.agentGenerate(payload);
    expect(botResponse).toBe('Unauthorized request');
});

test('Verify generate unsuccessfully when INVALID messageType', async ({ rawApiFixture }) => {
    const payload = {
        "username": "tienpham",
        "messageType": "Invalid type",
        "sessionId": '11223355',
        "model": "x-care-uncle",
        "prompt": "I am having a headache, what should I do?"
    }
    const authen = await rawApiFixture.getLoginData('tienpham', 'tienpham');
    await rawApiFixture.setBearerToken(authen.token);

    const botResponse = await rawApiFixture.agentGenerate(payload);
    expect(botResponse).toBe('Failed to prompt');
});




//================================================
// const graphQLClient = `
//   generate postGenerate($user_type: String!, $message_type: String!, $prompt: String!) {
//    postGenerate(user_type: $user_type, message_type: $message_type, prompt: $prompt) {
//      conversation {
//        user_content
//        bot_content
//      }
//    }
// `;

// test('Authentication', async ({ }) => {
    
// });
