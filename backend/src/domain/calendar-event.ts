/**
 * Core calendar-event types.
 *
 * These interfaces describe your application's data, independent of Express,
 * MongoDB, FullCalendar, or Gemini. Shared business types belong in `domain`.
 *
 * Keep API/database quirks out of these types when possible. Translate at the
 * controller or repository boundary instead.
 */
export interface CalendarEvent {
    id: string;
    title: string;
    start: string; // ISO 8601 date or date-time
    end: string;   // ISO 8601 date or date-time
    allDay: boolean;
    extendedProps: {
        location?: string;
        description?: string;
    };
}

/**
 * Input accepted by the create-event use case.
 *
 * This can differ from CalendarEvent because the server may generate an ID and
 * may supply defaults. Add runtime validation before trusting request data.
 */
export interface CreateCalendarEventInput {
    id?: string;
    title: string;
    start: string;
    end: string;
    allDay?: boolean;
    location?: string;
    description?: string;
}
