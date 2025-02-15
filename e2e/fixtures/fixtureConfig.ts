import { test as baseTest, expect, Expect } from '@playwright/test';
import { ApiFixture } from './apiFixture';
import { customMatchers } from './customMatchers';

interface CustomMatchers<R = void> {
    includeOneOfTheseValues(expectedValues: string[]): R;
}

interface ExtendedExpect extends Expect {
    <T = any>(value: T): CustomMatchers & Expect<T>;
}

type CustomFixtures = {
    apiFixture: ApiFixture;
    customExpect: ExtendedExpect;
}

export const test = baseTest.extend<CustomFixtures>({
    apiFixture: async ({ request }, use) => {
        const apiFixture = new ApiFixture(request);
        await apiFixture.getLoginData('tienpham', 'tienpham');
        await use(apiFixture);
    },
    customExpect: async ({ }, use) => {
        const customExpect = expect.extend(customMatchers) as unknown as ExtendedExpect;
        await use(customExpect);
    }
});

export { expect };
