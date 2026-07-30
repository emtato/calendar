import FullCalendar, {
    CalendarApi,
    DateClickInfo,
    DateSelectInfo,
    EventClickInfo,
    EventSourceFuncInfo
} from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/react/daygrid'

import themePlugin from '@fullcalendar/react/themes/monarch'
import '@fullcalendar/react/themes/monarch/theme.css'
import '@fullcalendar/react/themes/monarch/palettes/purple.css'
import '@fullcalendar/react/skeleton.css'
import interactionPlugin from '@fullcalendar/react/interaction'

import timeGridPlugin from '@fullcalendar/react/timegrid'
import multiMonthPlugin from '@fullcalendar/react/multimonth'

import {Temporal} from 'temporal-polyfill'

import React, {useRef, useState} from 'react'
import Popup, {MinimizedBar, Sidebar} from './EventDetails'
import {getCalendarEvents} from "./api/eventsAPI";

interface HighlightedRange {
    start: string
    end: string
}

function toLocalDateString(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function createDateList(startDate: string, daysBetween?: number) {
    const selected = Temporal.PlainDate.from(startDate)
    const dates: string[] = []

    for (let i = -7; i < 8; i++) {
        dates.push(selected.add({days: i}).toString())
        if (daysBetween && i == 7) {
            for (let j = 1; j < daysBetween; j++) {
                dates.push(selected.add({days: i + j}).toString())
            }
        }
    }


    return dates
}

export default function CalendarApp() {
    const [isPopOpen, setIsPopOpen] = useState(false)
    const [popupPos, setPopupPos] = useState({x: 0, y: 0});
    const [highlightedRange, setHighlightedRange] = useState<HighlightedRange | null>(null)
    const calendarApiRef = useRef<CalendarApi | null>(null)

    const [isSidebar, setSidebar] = useState(true)
    const [isMiniBar, setMinibar] = useState(false)

    const [selectedDate, setSelectedDate] = useState("")
    const [selectedEndDate, setSelectedEndDate] = useState("")
    const [startTime, setStartTime] = useState(9 * 60)
    const [endTime, setEndTime] = useState(10 * 60) //default

    const [dateList, setDateList] = useState<string[]>([])
    const [customTimeStart, setCustomTimeStart] = useState(0)
    const [customTimeEnd, setCustomTimeEnd] = useState(0)

    function closeBigBar() {
        setSidebar(false)
        setMinibar(true)
    }

    function openBigBar() {
        setSidebar(true)
        setMinibar(false)
    }

    function closePopup() {
        setIsPopOpen(false)
        setHighlightedRange(null)
        calendarApiRef.current?.unselect()
    }

    function handleDateDrag(selectInfo: DateSelectInfo) {
        setStartTime(9 * 60)
        setEndTime(10 * 60)
        console.log("Date range:", selectInfo.startStr, selectInfo.endStr)

        const startDateOnly = Temporal.PlainDate.from(selectInfo.startStr).toString();
        const endDateOnly = Temporal.PlainDate.from(selectInfo.endStr).toString();

        setHighlightedRange({
            start: selectInfo.startStr,
            end: selectInfo.endStr,
        })

        setIsPopOpen(true)
        if (selectInfo.jsEvent) {
            setPopupPos({
                x: selectInfo.jsEvent.clientX + 40,
                y: selectInfo.jsEvent.clientY,
            })
        }
        console.log("loc " + selectInfo.jsEvent?.x)
        const currentView = selectInfo.view.type;
        let temp = String(Temporal.PlainDate.from(endDateOnly))

        if (currentView === 'dayGridMonth' || currentView === "multiMonthYear") {
            temp = String(Temporal.PlainDate.from(endDateOnly).subtract({days: 1}))
        } else {
            const startTimeOnly = Temporal.PlainTime.from(selectInfo.startStr).toString();
            const endTimeOnly = Temporal.PlainTime.from(selectInfo.endStr).toString();

            const [hours, minutes, seconds] = startTimeOnly.split(":").map(Number);
            const startTimeMinutes = hours * 60 + minutes;
            const [hr, mn, s] = endTimeOnly.split(":").map(Number);
            const endTimeMinutes = hr * 60 + mn;
            setStartTime(startTimeMinutes)
            setEndTime(endTimeMinutes)
        }

        setSelectedDate(startDateOnly)
        setSelectedEndDate(temp)

        const start = Temporal.PlainDate.from(selectInfo.startStr)
        const end = Temporal.PlainDate.from(selectInfo.endStr)
        const daysBetween = start.until(end).days

        setDateList(createDateList(selectInfo.startStr, daysBetween))

        // The custom range remains visible while FullCalendar's internal
        // selection is cleared so another drag can begin normally.
        selectInfo.view.calendar.unselect()
    }

    function handleEventClick(selectInfo: EventClickInfo) {
        console.log("clicked event")
        setIsPopOpen(true)
        setPopupPos({x: selectInfo.jsEvent?.clientX + 40, y: selectInfo.jsEvent?.clientY,});
        console.log("loc " + selectInfo.jsEvent.clientX)

        const startDate = Temporal.PlainDate.from(selectInfo.event.startStr).toString();
        let endDate = selectInfo.event.endStr ? Temporal.PlainDate.from(selectInfo.event.endStr).toString() : startDate;

        let startTimeMinutes = 0;
        let endTimeMinutes = 0;

        if (!selectInfo.event.allDay) {
            const startTime = Temporal.PlainTime.from(selectInfo.event.startStr).toString();
            const endTime = Temporal.PlainTime.from(selectInfo.event.endStr).toString();
            const [starthours, startminutes, startseconds] = startTime.split(":").map(Number);
            const [endhours, endminutes, endseconds] = endTime.split(":").map(Number);
            //convert time to minutes after 0
            startTimeMinutes = starthours * 60 + startminutes;
            endTimeMinutes = endhours * 60 + endminutes;
        } else {
            endDate = Temporal.PlainDate.from(selectInfo.event.endStr).subtract({days: 1}).toString();
            endTimeMinutes = 24 * 60 - 1; //set end time to 11:59 PM
        }
        if (startTimeMinutes % 30 != 0 || endTimeMinutes % 15 != 0) {
            if (startTimeMinutes % 30 != 0) {
                setCustomTimeStart(startTimeMinutes)
            }
            if (endTimeMinutes % 15 != 0) {
                setCustomTimeEnd(endTimeMinutes)
            }
        }
        setSelectedDate(startDate)
        setSelectedEndDate(endDate)
        setEndTime(endTimeMinutes)
        setStartTime(startTimeMinutes)

        const daysBetween = Temporal.PlainDate.from(startDate).until(endDate).days
        setDateList(createDateList(startDate, daysBetween))
    }

    function handleEvents() {
        //    console.log("event")

    }

    function handleDateClick(clickInfo: DateClickInfo) {
        setStartTime(9 * 60)
        setEndTime(10 * 60)
        console.log("Single date:", clickInfo.dateStr)
        setIsPopOpen(true)
        setPopupPos({x: clickInfo.jsEvent?.clientX + 40, y: clickInfo.jsEvent?.clientY,});
        console.log("loc " + clickInfo.jsEvent.clientX)

        const dateOnly = Temporal.PlainDate.from(clickInfo.dateStr).toString();

        const nextDate = Temporal.PlainDate.from(dateOnly).add({days: 1}).toString()

        calendarApiRef.current = clickInfo.view.calendar
        clickInfo.view.calendar.unselect()
        setHighlightedRange({
            start: dateOnly,
            end: nextDate,
        })

        setSelectedDate(dateOnly)
        setSelectedEndDate(dateOnly)
        setDateList(createDateList(dateOnly))

        const currentView = clickInfo.view.type;
        if (currentView === 'timeGridWeek' || currentView === "timeGridDay") {
            const TimeOnly = Temporal.PlainTime.from(clickInfo.dateStr).toString();
            const [hours, minutes, seconds] = TimeOnly.split(":").map(Number);
            const startTimeMinutes = hours * 60 + minutes;
            setStartTime(startTimeMinutes)
            setEndTime(startTimeMinutes + 60)
        }
    }

    return (
        <div className={`app ${isSidebar ? '' : 'app-sidebar-collapsed'}`}>
            {/* determine layout ratio depending on if sidebar is here*/}
            <div className='calendar-main'>
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
                    dayCellClass={(dayInfo) => {
                        const cellDate = toLocalDateString(dayInfo.date)

                        return highlightedRange &&
                        cellDate >= highlightedRange.start &&
                        cellDate < highlightedRange.end
                            ? 'calendar-selection-highlight'
                            : ''
                    }}
                    dateClick={handleDateClick}
                    select={handleDateDrag}
                    // eventContent={renderEventContent} // custom render function
                    eventClick={handleEventClick}
                    eventsSet={handleEvents} // called after events are initialized/added/changed/removed
                    events={(fetchInfo: EventSourceFuncInfo) => {
                        return getCalendarEvents(fetchInfo.startStr, fetchInfo.endStr)
                    }}
                />
            </div>
            <Popup //passing info into popup
                isOpen={isPopOpen}
                onClose={closePopup}
                position={popupPos}
                startDate={selectedDate}
                endDate={selectedEndDate}
                dateList={dateList}
                initialStartTime={startTime}
                initialEndTime={endTime}
                generateSpecificTimeOption={[customTimeStart, customTimeEnd]}

            />
            <Sidebar isOpen={isSidebar} onClose={closeBigBar}
            />
            <MinimizedBar isOpen={isMiniBar} onClose={openBigBar}
            />
        </div>
    )

}
