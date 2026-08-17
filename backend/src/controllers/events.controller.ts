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
import {calendarService} from "../services/calendar.service.js";
import type {CalendarEvent} from "../domain/calendar-event.js";

export async function handleListEvents(request: any, response: any): Promise<CalendarEvent[]> {

    const startDate = request.query.start;
    const endDate = request.query.end;
    const events = await calendarService.getEvents(startDate, endDate)
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
    const id = request.params.id;
    const event = await calendarService.deleteEvent(id);
    response.status(204).end(event);
    return event;
}

export async function handleRestoreEvent(request: any, response: any) {
    const event = await calendarService.restoreEvent(request.body);
    response.status(201).json(event);
    return event;
}
