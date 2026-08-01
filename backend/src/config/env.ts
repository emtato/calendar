/**
 * provides one central place for environment-dependent settings, import this file isntead of reading env
 */
function readPort(value: string | undefined): number {
    const port = Number(value ?? 5001);

    if (!Number.isInteger(port) || port <= 0) {
        throw new Error("PORT must be a positive integer.");
    }

    return port;
}

export const env = {
    port: readPort(process.env.PORT),
    mongoUri: process.env.MONGODB_URI,
    geminiApiKey: process.env.GEMINI_API_KEY,
};
