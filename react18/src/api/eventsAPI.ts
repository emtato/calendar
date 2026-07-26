import type {
    CalendarEvent,
} from "../../../backend/src/CalendarEvent";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

/*
 * Update fields that may be changed when editing an existing event
 * Partial makes every field optional because an update may change only one field, such as the title, without resending the entire event
 */
export type UpdateCalendarEventInput = Partial<CalendarEvent>;

/*
 * Change one or more fields belonging to an existing calendar event
 *
 * Intended request: PATCH /api/events/:eventId
 * `eventId`: identifies the event to change
 * `changes`: contains only the fields that should be changed
 * Returns: the updated event received from the backend
 */
export async function updateCalendarEvent(eventId: string, changes: UpdateCalendarEventInput): Promise<CalendarEvent> {
    throw new Error("updateCalendarEvent is not implemented yet");
}

/**
 * Retrieve every calendar event the current user is alloed to see
 *
 * Intended request: GET /api/events
 * Returns: the events received from the backend
 * endStr is exclusive (Fullcalendar)
 */
export async function getCalendarEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const response = await fetch(`${SERVER_URL}/api/events`);
    console.log("received response" + response)
    const events = await response.json();
    console.log("received events", events)
    return events
}

/*
 * Retrieve one calendar event using its unique ID
 *
 * Intended request: GET /api/events/:eventId
 * `eventId`: identifies the event to retrieve
 * Returns: the matching event received from the backen
 */
export async function getCalendarEventById(eventId: string): Promise<CalendarEvent> {
    throw new Error("not implemented yet");
}

/**
 * Save a newly created calendar event
 *
 * Intended request: POST /api/events
 * `event`: the user-entered information for the new event
 * Returns: the saved event, including the ID assigned by the backend
 */
export async function createCalendarEvent(event: CalendarEvent): Promise<CalendarEvent> {
    throw new Error("createCalendarEvent is not implemented yet");
}


/**
 * Permanently remove an existing calendar event
 *
 * Intended request: DELETE /api/events/:eventId
 * `eventId`: identifies the event to remove
 * Returns: nothing after the backend confirms the deletion
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
    throw new Error("deleteCalendarEvent is not implemented yet");
}
