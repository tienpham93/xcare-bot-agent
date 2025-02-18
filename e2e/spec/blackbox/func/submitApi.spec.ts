import { test, expect } from '../../../fixtures/fixtureConfig';

test('Verify submit successfully with VALID Bearer token', async ({ rawApiFixture }) => {
    const payload = {
        "username": "tienpham",
        "messageType": "submit",
        "sessionId": "111",
        "model": "x-care-uncle",
        "prompt": `I would like to submit a ticket with title: Unreasonable charged for medicine bill and content: I've got a surcharge when brought 2 pairs of pain killer on Jan 20`
    }

    const authen = await rawApiFixture.getLoginData('tienpham', 'tienpham');
    await rawApiFixture.setBearerToken(authen.token);

    const botResponse = await rawApiFixture.agentGenerate(payload);
    expect(botResponse).not.toBeNull();
});

test('Verify submit unsuccessfully with INVALID Bearer token', async ({ rawApiFixture }) => {
    const payload = {
        "username": "tienpham",
        "messageType": "submit",
        "sessionId": "24234",
        "model": "x-care-uncle",
        "prompt": `I would like to submit a ticket with title: Unreasonable charged for medicine bill and content: I've got a surcharge when brought 2 pairs of pain killer on Jan 20`
    }

    await rawApiFixture.setBearerToken('Invalid token');

    const botResponse = await rawApiFixture.agentGenerate(payload);
    expect(botResponse).toBe('Unauthorized request');
});

test('Verify submit unsuccessfully when INVALID submit form', async ({ rawApiFixture }) => {
    const payload = {
        "username": "tienpham",
        "messageType": "submit",
        "sessionId": '11223355',
        "model": "x-care-uncle",
        "prompt": `Hello world`
    }
    const authen = await rawApiFixture.getLoginData('tienpham', 'tienpham');
    await rawApiFixture.setBearerToken(authen.token);

    const botResponse = await rawApiFixture.agentGenerate(payload);
    expect(botResponse).toContain('please submit again');
});


//================================================
// const graphQLClient = `
//   generate postSubmit($user_type: String!, $message_type: String!, $prompt: String!) {
//    postSubmit(user_type: $user_type, message_type: $message_type, prompt: $prompt) {
//      conversation {
//        user_content
//        bot_content {
//          ticket_id
//          created_by
//          created_date
//          title
//          content
//        }
//      }
//    }
// `;