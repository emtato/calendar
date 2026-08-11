/**
 * Calendar use cases (the central backend logic).
 *
 *  Put workflows here, such as:
 * 1. validate/normalize an incoming event;
 * 2. ask Gemini to extract missing fields;
 * 3. combine user-provided and extracted values;
 * 4. save the final event through the repository;
 * 5. return the saved event.
 *
 * Keep HTTP objects (`request`, `response`) out of this file. Also avoid raw
 * MongoDB calls and Gemini SDK calls; those belong behind their own adapters.
 */
import {
    CalendarEvent, SaveCalendarEventInput,
} from "../domain/calendar-event";
import {eventStorage} from "../repositories/event.storage";
import {randomUUID} from "node:crypto";

async function saveEvent(input: SaveCalendarEventInput): Promise<CalendarEvent> {
    console.log("event loc" , input.extendedProps.location)
    //TODO: gemini first pass layer to extract advanced location/time data first
    if(input.allDay){
        input.endDate = addOneDay(input.endDate)
    }
    if (input.id == "") { //new event
        input.id = randomUUID();
        const event = ConvertToCalendarEvent(input);
       await eventStorage.createEvent(event)
        return event;
    } //preixisting event being saved
    const event = ConvertToCalendarEvent(input);
   await eventStorage.saveEvent(event)
    return event
}
async function restoreEvent(input: SaveCalendarEventInput): Promise<CalendarEvent> {
    if(input.allDay){
        input.endDate = addOneDay(input.endDate)
    }
        const event = ConvertToCalendarEvent(input);
       await eventStorage.createEvent(event)
        return event;
}

async function getEvents(start: string, end: string): Promise<CalendarEvent[]> {
    return eventStorage.getEvents(start, end)

}

async function deleteEvent(id: string): Promise<void> {
    await eventStorage.deleteEvent(id)

}
//                          helper functions
// ————————————————————————————————————————————————————————————————————

function convertTime(Date: string, Time: number): string {
    const H = Math.floor(Time / 60);
    const M = Time % 60;
    const S = "00"
    const HFormatted = H.toString().padStart(2, "0");
    const MFormatted = M.toString().padStart(2, "0");

    const TimeFormatted = HFormatted + ":" + MFormatted + ":" + S;
    const combinedStart = Date + "T" + TimeFormatted;
    return combinedStart;
}

function ConvertToCalendarEvent(input: SaveCalendarEventInput): CalendarEvent {
    const combinedStart = convertTime(input.startDate, input.startTime);
    const combinedEnd = convertTime(input.endDate, input.endTime);

    const event: CalendarEvent = {
        id: input.id,
        title: input.title,
        start: combinedStart,
        end: combinedEnd,
        allDay: input.allDay,
        extendedProps: {
            location: input.extendedProps.location,
            description: input.extendedProps.description,
            guests: input.extendedProps.guests,
        },
    };
    return event;

}

//add one day to an all day event. Fullcalendar interprets exclusive end dates, while we display inclusive. re add 1 day to db so reinterpretation of the range is correct
function addOneDay(date: string): string {
    const value = new Date(`${date}T00:00:00Z`);
    value.setUTCDate(value.getUTCDate() + 1);
    return value.toISOString().slice(0, 10);
}

export const calendarService = {
    saveEvent, getEvents, deleteEvent, restoreEvent
};
