import FullCalendar, {DateClickInfo, DateSelectInfo} from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/react/daygrid'

import themePlugin from '@fullcalendar/react/themes/monarch'
import '@fullcalendar/react/themes/monarch/theme.css'
import '@fullcalendar/react/themes/monarch/palettes/purple.css'
import '@fullcalendar/react/skeleton.css'
import interactionPlugin from '@fullcalendar/react/interaction'

import timeGridPlugin from '@fullcalendar/react/timegrid'
import multiMonthPlugin from '@fullcalendar/react/multimonth'
import {INITIAL_EVENTS} from "./event-utils";

import {useState} from 'react'
import Popup from './EventDetails'

export default function CalendarApp() {
    const [isPopOpen, setIsPopOpen] = useState(false)

    function handleDateDrag(selectInfo: DateSelectInfo) {
        console.log("dates dragged")
        console.log("Date range:", selectInfo.startStr, selectInfo.endStr)
        setIsPopOpen(true)
    }

    function handleEventClick() {
        console.log("clicked event")
        setIsPopOpen(true)

    }

    function handleEvents() {
        console.log("event")

    }

    function handleDateClick(clickInfo: DateClickInfo) {
        console.log("date click")
        console.log("Single date:", clickInfo.dateStr)
        setIsPopOpen(true)

    }

    return (
        <>
            <FullCalendar
                plugins={[
                    themePlugin,
                    dayGridPlugin,
                    timeGridPlugin,
                    multiMonthPlugin,
                    interactionPlugin

                ]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'timeGridDay,timeGridWeek,dayGridMonth,multiMonthYear'
                }}
                editable={true} selectMinDistance={10}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                dateClick={handleDateClick}
                initialEvents={INITIAL_EVENTS} // alternatively, use the `events` setting to fetch from a feed
                select={handleDateDrag}
                // eventContent={renderEventContent} // custom render function
                eventClick={handleEventClick}
                eventsSet={handleEvents} // called after events are initialized/added/changed/removed
            />
            <Popup
                isOpen={isPopOpen}
                onClose={() => setIsPopOpen(false)}
            />
        </>
    )
}

