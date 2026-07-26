export interface CreateCalendarEventInput {
    title: string;
    startDate: string;   // "2026-07-25"
    startTime?: string;  // "15:00"
    endDate?: string;
    endTime?: string;
    location?: string;
    description?: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    location?: string;
    start?: string;
    end?: string;
}
