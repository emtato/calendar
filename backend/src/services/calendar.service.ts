/**
 * Calendar use cases (the central backend logic).
 *
 * This is the coordination layer you were describing as "main." Put workflows
 * here, such as:
 * 1. validate/normalize an incoming event;
 * 2. ask Gemini to extract missing fields;
 * 3. combine user-provided and extracted values;
 * 4. save the final event through the repository;
 * 5. return the saved event.
 *
 * Keep HTTP objects (`request`, `response`) out of this file. Also avoid raw
 * MongoDB calls and Gemini SDK calls; those belong behind their own adapters.
 */
import type {
    CalendarEvent,
    CreateCalendarEventInput,
} from "../domain/calendar-event";

async function createEvent(
    input: CreateCalendarEventInput,
): Promise<CalendarEvent> {
    // Temporary result so the new structure remains runnable. Replace this
    // with calls to geminiService and eventRepository as you build each layer.
    return {
        id: input.id ?? crypto.randomUUID(),
        title: input.title,
        start: input.start,
        end: input.end,
        allDay: input.allDay ?? false,
        extendedProps: {
            location: input.location,
            description: input.description,
        },
    };
}

export const calendarService = {
    createEvent,
};
