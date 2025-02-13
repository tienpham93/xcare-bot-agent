export function containsExpectedValue(response: string, expectedValues: string[]): boolean {
    return expectedValues.some(value => {
        const valueLowerCase = value.toLowerCase();
        return response.toLowerCase().includes(valueLowerCase);
    });
}