/**
 * Compatibility export.
 *
 * New code should import event types from `domain/calendar-event`. This file
 * remains temporarily so older imports do not break while the backend is being
 * reorganized. Delete it after all imports use the new location.
 */
export type {
    CalendarEvent,
    CreateCalendarEventInput,
} from "./domain/calendar-event";
