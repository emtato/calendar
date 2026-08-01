/**
 * Gemini adapter.
 *
 * Put Gemini-specific details here: SDK setup, model name, prompts, API calls,
 * and conversion of model output into your own TypeScript types.
 *
 * The rest of the backend should call a meaningful function such as
 * `extractEventDetails(text)`, rather than knowing how Gemini itself works.
 * This isolation makes model changes and tests much easier.
 *
 * Do not commit an API key. Read it through config/env.ts when you add the SDK.
 */

// Suggested eventual shape:
// export async function extractEventDetails(text: string): Promise<Partial<CalendarEvent>> {
//     // Call Gemini, validate its structured result, and return your own type.
// }

export const geminiService = {
    // Add public Gemini operations here as you implement them.
};
