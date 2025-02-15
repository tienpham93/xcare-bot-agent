import { test } from '@playwright/test';

export const customMatchers = {
    includeOneOfTheseValues(received: string, expectedValues: string[]) {
        test.info().annotations.push({ type: 'received', description: received });
        test.info().annotations.push({ type: 'expected', description: expectedValues.join('|') });

        const pass = expectedValues.some(value => received.toLowerCase().includes(value.toLowerCase()));
        return {
            pass,
            message: () => pass ? 'Expected values found in response' : 'Expected values not found in response',
        };
    }
};