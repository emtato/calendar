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

export async function handleListEvents(_request: any, response: any) {
    response.json(testEvents);
    //call getEvents
}

export async function handleCreateEvent(request: any, response: any) {
    // The controller passes input inward. The service decides how Gemini and
    // MongoDB participate in creating the event.
    const event = await calendarService.saveEvent(request.body);
    response.status(201).json(event);
    return event;
}
export async function deleteEvent(_request: any, response: any) {

}

