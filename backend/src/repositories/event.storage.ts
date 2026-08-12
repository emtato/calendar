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
import type {CalendarEvent} from "../domain/calendar-event";
import {getDatabase} from "../config/mongodb";

export const eventStorage = {
    saveEvent,
    createEvent,
    deleteEvent,
    getEvents,
};

const storageCollection = "events";

async function getEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const db = await getDatabase();
    const eventsCollection = db.collection<CalendarEvent>(storageCollection);

    return eventsCollection.find({start: {$lt: endDate}, end: {$gt: startDate},}).toArray();
    // any event end date that extends into the startDate range and any event start date that happens before endDate
}

async function saveEvent(event: CalendarEvent) {
    const db = await getDatabase()
    const eventsCollection = db.collection<CalendarEvent>(storageCollection);

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
    const eventsCollection = db.collection<CalendarEvent>(storageCollection);

    const result = await eventsCollection.insertOne(event);
    return result;
}

async function deleteEvent(id: string) {
    const db = await getDatabase()
    const eventsCollection = db.collection<CalendarEvent>(storageCollection);
    const result = await eventsCollection.deleteOne({id: id});
    return result;
}
