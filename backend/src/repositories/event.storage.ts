/**
 * MongoDB persistence adapter for calendar events.
 *
 * Repository functions should describe data operations in application terms:
 * `findAll`, `findById`, `insert`, `update`, and `remove`.
 * Raw collection names, filters, ObjectIds, and MongoDB driver calls belong
 * here—not in routes, controllers, or calendar.service.ts.
 *
 * Import `getDatabase()` from config/mongodb.ts when implementing these
 * operations. Convert database documents to domain types before returning.
 */
import mongodb from "mongodb";
import {CalendarEvent, SaveCalendarEventInput} from "../domain/calendar-event";
import {getDatabase} from "../config/mongodb";

export const eventStorage = {
    saveEvent,
    createEvent,
    deleteEvent,
    getEvents,
};

function getEvents(start: string, end: string) {

}

async function saveEvent(event: CalendarEvent) {
    const db = await getDatabase()
    const eventsCollection = db.collection<CalendarEvent>("events");

    const result = await eventsCollection.updateOne(
        {id: event.id},
        { //whcih fields to update
            $set: {
                title: event.title,
                start: event.start,
                end: event.end,
                allDay: event.allDay,
                extendedProps: event.extendedProps,
            },
        },
    );
    return result;
}

async function createEvent(event: CalendarEvent) {
    const db = await getDatabase()
    const eventsCollection = db.collection<CalendarEvent>("events");

    const result = await eventsCollection.insertOne(event);
    return result;
}

function deleteEvent(id: string) {
}
