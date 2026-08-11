import type {
    CalendarEvent,
    SaveCalendarEventInput,
} from "../../../backend/src/CalendarEvent";
import {simpleTimeLocationExtractor} from "../utils/simple_time_location_extractor";
import type {DeletedEvent} from "../Calendarapp";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

/**
 * Retrieve every calendar event the current user is alloed to see
 *
 * Intended request: GET /api/events
 * Returns: the events received from the backend
 * endStr is exclusive (Fullcalendar)
 */
export async function getCalendarEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {

    const response = await fetch(`${SERVER_URL}/api/events?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`)
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
export async function saveCalendarEvent(event: SaveCalendarEventInput): Promise<CalendarEvent> {
    //run time/location extractor again in case the user saved it before timer ran out
    const [returnTime, returnlocation, returnTitle] = simpleTimeLocationExtractor(event.title, false, false)
    event.title = returnTitle
    if (returnTime != "") {
        const [hours, minutes] = returnTime.split(":").map(Number);
        event.startTime = hours * 60 + minutes;
    }
    if(returnlocation != ""){
        event.extendedProps.location = returnlocation
    }

    const response = await fetch(`${SERVER_URL}/api/events/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
    })
    return response.json() //return id inside the returned full calendarEvent object
}


/**
 * Permanently remove an existing calendar event
 *
 * Intended request: DELETE /api/events/:eventId
 * `eventId`: identifies the event to remove
 * Returns: nothing after the backend confirms the deletion
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
    const response = await fetch(`${SERVER_URL}/api/events/${eventId}`, {
        method: 'DELETE'
    })
    if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
    }
    return;
}

export async function restoreEvent(input: DeletedEvent): Promise<CalendarEvent>{
const response = await fetch(`${SERVER_URL}/api/events/restore`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
    })
    return response.json()

}
