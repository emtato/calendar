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

export async function listEvents(_request: any, response: any) {
    // Temporary data source. Replace this call with calendarService.listEvents()
    // once the MongoDB repository is connected.
    response.json(testEvents);
}

export async function createEvent(request: any, response: any) {
    // The controller passes input inward. The service decides how Gemini and
    // MongoDB participate in creating the event.
    const event = await calendarService.createEvent(request.body);
    response.status(201).json(event);
}
