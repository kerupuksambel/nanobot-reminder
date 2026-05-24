export const removeCodeFormatting = (input: string) => {
    const match = input.match(/^```(?:\w+)?\n?([\s\S]*?)\n?```$/);

    if (!match) {
        return input;
    }

    return match[1];
}