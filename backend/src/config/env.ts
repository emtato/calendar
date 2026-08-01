/**
 * Environment configuration.
 *
 * Read process.env only here, then export typed application settings. This
 * prevents environment-variable names and fallback values from spreading
 * throughout the backend.
 *
 * Secrets belong in a local .env file or deployment environment, never in Git.
 * As you add required values, fail early with a clear message when one is absent.
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
    mongoDatabase: process.env.MONGODB_DATABASE ?? "calendar",
    geminiApiKey: process.env.GEMINI_API_KEY,
};
