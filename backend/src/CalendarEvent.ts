/*
export interface CreateCalendarEventInput {
    title: string;
    startDate: string;   // "2026-07-25"
    endDate: string;
    startTime: string;  // "15:00"
    endTime: string;
    location?: string;
    description?: string;
}
*/

export interface CalendarEvent {
    id: string;
    title: string;
    start: string;   // "2026-07-25"
    end: string;
    allday: boolean;
    extendedProps: {
        location?: string;
        description?: string;
    }
}
