import FullCalendar, {DateClickInfo, DateSelectInfo, EventClickInfo} from '@fullcalendar/react'
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
    const [popupPos, setPopupPos] = useState({x: 0, y: 0});

    function handleDateDrag(selectInfo: DateSelectInfo) {
        console.log("dates dragged")
        console.log("Date range:", selectInfo.startStr, selectInfo.endStr)
        setIsPopOpen(true)
        // @ts-ignore
        setPopupPos({x: selectInfo.jsEvent?.clientX + 40, y: selectInfo.jsEvent?.clientY,});
        console.log("loc " + selectInfo.jsEvent?.x)
    }

    function handleEventClick(selectInfo: EventClickInfo) {
        console.log("clicked event")
        setIsPopOpen(true)
        setPopupPos({x: selectInfo.jsEvent?.clientX + 40, y: selectInfo.jsEvent?.clientY,});
        console.log("loc " + selectInfo.jsEvent.clientX)

    }

    function handleEvents() {
        console.log("event")

    }

    function handleDateClick(clickInfo: DateClickInfo) {
        console.log("date click")
        console.log("Single date:", clickInfo.dateStr)
        setIsPopOpen(true)
        setPopupPos({x: clickInfo.jsEvent?.clientX + 40, y: clickInfo.jsEvent?.clientY,});
        console.log("loc " + clickInfo.jsEvent.clientX)
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
                position={popupPos}

            />
        </>
    )
}

