/**
 * HTTP controller for calendar events.
 *
 * Controllers translate between Express and the application:
 * - read route parameters, query strings, and request bodies;
 * - call a service;
 * - choose an HTTP status and response body;
 * - pass failures to the error-handling middleware (when one is added).
 *
 * Do not put MongoDB queries or Gemini prompts directly in controllers.
 */
import testEvents from "../testEvents.json";
import {calendarService} from "../services/calendar.service";
import {CalendarEvent} from "../domain/calendar-event";

export async function handleListEvents(request: any, response: any): Promise<CalendarEvent[]> {

    const startDate = request.query.start;
    const endDate = request.query.end;
    const events = await calendarService.getEvents(startDate, endDate)
   // console.log("events in events controller", events)
    response.status(200).json(events);

    return events;
}

export async function handleCreateEvent(request: any, response: any) {
    // The controller passes input inward. The service decides how Gemini and
    // MongoDB participate in creating the event.
    const event = await calendarService.saveEvent(request.body);
    response.status(201).json(event);
    return event;
}

export async function deleteEvent(request: any, response: any) {

}

