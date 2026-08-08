import FullCalendar, {
    CalendarApi,
    DateClickInfo,
    DateSelectInfo,
    EventClickInfo,
    EventSourceFuncInfo,
    CalendarRef,
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

import React, {useEffect, useRef, useState} from 'react'
import Popup, {MinimizedBar, Sidebar} from './EventDetails'
import {deleteCalendarEvent, getCalendarEvents, restoreEvent} from "./api/eventsAPI";


// ----------------------------------------------------
// Types
// ----------------------------------------------------

interface HighlightedRange {
    start: string
    end: string
}

export interface DeletedEvent {
    id: string;
    title: string;
    startTime: number;
    endTime: number;
    startDate: string;
    endDate: string;
    allDay: boolean;
    extendedProps: {
        location: string;
        description: string;
    };
}

// ----------------------------------------------------
// Calendar data and date utils
// ----------------------------------------------------

function fetchCalendarEvents(fetchInfo: EventSourceFuncInfo) {
    return getCalendarEvents(fetchInfo.startStr, fetchInfo.endStr);
}

function toLocalDateString(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function getMinutesAfterMidnight(dateTime: string) {
    const time = Temporal.PlainTime.from(dateTime)
    return time.hour * 60 + time.minute
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

// ====================================================
// calendar app
// ====================================================

export default function CalendarApp() {
    // ------------------------------------------------
    // state
    // ------------------------------------------------

    const [isPopOpen, setIsPopOpen] = useState(false)
    const [popupPos, setPopupPos] = useState({x: 0, y: 0});
    const [highlightedRange, setHighlightedRange] = useState<HighlightedRange | null>(null)
    const calendarApiRef = useRef<CalendarApi | null>(null)
    const calendarComponentRef = useRef<CalendarRef | null>(null);
    const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [isSidebar, setSidebar] = useState(true)
    const [isMiniBar, setMinibar] = useState(false)

    const [selectedDate, setSelectedDate] = useState("")
    const [selectedEndDate, setSelectedEndDate] = useState("")
    const [startTime, setStartTime] = useState(9 * 60)
    const [endTime, setEndTime] = useState(10 * 60) //default
    const [deletePopupUndo, setDeletePopup] = useState(false)

    const [dateList, setDateList] = useState<string[]>([])

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [id, setId] = useState("")

    const justDragged = useRef(false)
    const [allDay, setAllDay] = useState(false)
    const [justDeletedEvent, setJustDeletedEvent] = useState<DeletedEvent | null>(null);
    const [visibleMonthTitle] = useState(() => new Intl.DateTimeFormat(undefined, {
            month: 'long',
            year: 'numeric'
        }).format(new Date())
    )

    // ------------------------------------------------
    // Sidebar functions
    // ------------------------------------------------

    function closeBigBar() {
        setSidebar(false)
        setMinibar(true)
    }

    function openBigBar() {
        setSidebar(true)
        setMinibar(false)
    }

    // ------------------------------------------------
    // Calendar refresh and temp events
    // ------------------------------------------------

    function refreshCalendar() {
        calendarComponentRef.current?.getApi().refetchEvents();
    }

    function displayNewEventPlaceholder(clickInfo: CalendarApi, startDate: string, endDate: string, startTime?: string, endTime?: string) {
        const calendar = clickInfo.view.calendar

        // Remove the previous temporary banner.
        calendar.getEventById('draft-event')?.remove()

        if (clickInfo.view.type === 'dayGridMonth' || clickInfo.view.type === 'multiMonthYear') {
            calendar.addEvent({
                id: 'draft-event',
                title: 'New Event',
                start: startDate,
                end: endDate,
                allDay: true,
                editable: false,
            })
        } else {
            calendar.addEvent({
                id: 'draft-event',
                title: 'New Event',
                start: startDate + "T" + startTime,
                end: endDate + "T" + endTime,
                startEditable: true,
                endEditable: true,
                editable: true,
            })
        }
    }

    // ------------------------------------------------
    // popup
    // ------------------------------------------------

    function closePopup() {
        setIsPopOpen(false)
        setHighlightedRange(null)
        calendarApiRef.current?.unselect()
        calendarApiRef.current?.getEventById('draft-event')?.remove()
        setStartTime(9 * 60)
        setEndTime(10 * 60)
        setSelectedDate("")
        setSelectedEndDate("")
        setTitle("")
        setDescription("")
    }

    function resetStates() {
        setTitle("")
        setDescription("")
        setId("")
        setAllDay(false)
    }

    async function startDeleteTimer(event: DeletedEvent) {
        closePopup();
        if (event.id != "") {
            setJustDeletedEvent(event)
            await deleteCalendarEvent(id)
            setDeletePopup(true);
            refreshCalendar();
        }
        //runs awaited function after 5 seconds
        deleteTimer.current = setTimeout(async () => {
            setJustDeletedEvent(null)
            deleteTimer.current = null;
            setDeletePopup(false);
        }, 5000);
    }

    async function undoDelete() {
        if (deleteTimer.current !== null && justDeletedEvent !== null) {
            clearTimeout(deleteTimer.current); //cancel the tiemer by the identifier deletetimer.current
            await restoreEvent(justDeletedEvent);// re save event from cache
            // console.log("event restored", justDeletedEvent)

            refreshCalendar();
            deleteTimer.current = null;
        }
        setDeletePopup(false); // hide undo button
    }

    async function deleteEvent() {
        if (id === "") {
            closePopup()
            return
        }

        await deleteCalendarEvent(id)
        refreshCalendar(); //refresh calendar events
        closePopup()
    }

    useEffect(() => {
            function handleKeyDown(event: KeyboardEvent) {
                if (event.key !== "Escape" && event.key != "n") {
                    return;
                }

                if (event.key == "n") {
                    if (!isPopOpen) {
                        setIsPopOpen(true)
                        setPopupPos({x: 1000, y: 300})
                        const today = new Date();
                        const todayString = today.toISOString().split('T')[0];
                        setSelectedDate(todayString)
                        setDateList(createDateList(todayString))
                        setSelectedEndDate(todayString)
                        //displayNewEventPlaceholder(calendarApiRef, todayString, todayString, "4",  todayString)
                        //TODO
                    }
                    return
                }

                if (isPopOpen) {
                    closePopup();
                    return;
                }
                if (isSidebar) {
                    closeBigBar();
                }
            }

            window.addEventListener("keydown", handleKeyDown);

            return () => {
                window.removeEventListener("keydown", handleKeyDown);
            };
        },
        [isPopOpen, isSidebar]
    );
// ------------------------------------------------
// user fullcalendar interactions
// ------------------------------------------------

    function handleDateClick(clickInfo: DateClickInfo) {
        if (justDragged.current) {
            return
        }
        resetStates()

        setStartTime(9 * 60)
        setEndTime(10 * 60)

        //console.log("Single date:", clickInfo.dateStr)
        setIsPopOpen(true)
        setPopupPos({x: clickInfo.jsEvent?.clientX, y: clickInfo.jsEvent?.clientY});
        // console.log("loc " + clickInfo.jsEvent.clientX)

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
            const startTimeMinutes = getMinutesAfterMidnight(TimeOnly);
            setStartTime(startTimeMinutes)
            setEndTime(startTimeMinutes + 60)
            displayNewEventPlaceholder(clickInfo.view.calendar, dateOnly, dateOnly, TimeOnly, Temporal.PlainTime.from(clickInfo.dateStr).add({minutes: 60}).toString())

        } else {
            displayNewEventPlaceholder(clickInfo.view.calendar, dateOnly, dateOnly)
        }
    }

    function handleDateDrag(selectInfo: DateSelectInfo) {
        resetStates()

        //prevent dragging from triggering date click
        justDragged.current = true
        setTimeout(() => {
            justDragged.current = false
        }, 0)

        calendarApiRef.current = selectInfo.view.calendar
        setStartTime(9 * 60)
        // console.log("Date range:", selectInfo.startStr, selectInfo.endStr)

        const startDateOnly = Temporal.PlainDate.from(selectInfo.startStr).toString();
        const endDateOnly = Temporal.PlainDate.from(selectInfo.endStr).toString();

        setHighlightedRange({
            start: selectInfo.startStr,
            end: selectInfo.endStr,
        })

        setIsPopOpen(true)
        if (selectInfo.jsEvent) {
            setPopupPos({x: selectInfo.jsEvent.clientX, y: selectInfo.jsEvent.clientY,})
        }
        // console.log("loc " + selectInfo.jsEvent?.x)
        const currentView = selectInfo.view.type;
        let temp = String(Temporal.PlainDate.from(endDateOnly))

        if (currentView === 'dayGridMonth' || currentView === "multiMonthYear") {

            if (startDateOnly === endDateOnly) {
                setEndTime(10 * 60)
            } else {
                setEndTime(9 * 60)
            }
            temp = String(Temporal.PlainDate.from(endDateOnly).subtract({days: 1}))
            displayNewEventPlaceholder(selectInfo.view.calendar, startDateOnly, endDateOnly)
        } else {
            const startTimeOnly = Temporal.PlainTime.from(selectInfo.startStr).toString();
            const endTimeOnly = Temporal.PlainTime.from(selectInfo.endStr).toString();

            setStartTime(getMinutesAfterMidnight(startTimeOnly));
            setEndTime(getMinutesAfterMidnight(endTimeOnly))
            displayNewEventPlaceholder(selectInfo.view.calendar, startDateOnly, endDateOnly, startTimeOnly, endTimeOnly)
        }

        setSelectedDate(startDateOnly)
        setSelectedEndDate(temp)

        const start = Temporal.PlainDate.from(selectInfo.startStr)
        const end = Temporal.PlainDate.from(selectInfo.endStr)
        const daysBetween = start.until(end).days

        setDateList(createDateList(selectInfo.startStr, daysBetween))

        // The custom range remains visible while FullCalendar's internal
        // selection is cleared so another drag can begin normally.
        if (currentView === 'dayGridMonth' || currentView === "multiMonthYear") {
            selectInfo.view.calendar.unselect()
        }
    }

    function handleEventClick(selectInfo: EventClickInfo) {
        calendarApiRef.current = selectInfo.view.calendar
        setIsPopOpen(true)
        setPopupPos({x: selectInfo.jsEvent?.clientX, y: selectInfo.jsEvent?.clientY,});
        // console.log("loc " + selectInfo.jsEvent.clientX)

        //display info: title
        const title = selectInfo.event.title;
        setTitle(title)
        setId(selectInfo.event.id)
        setAllDay(selectInfo.event.allDay)

        //display info: start, end time and date
        const startDate = Temporal.PlainDate.from(selectInfo.event.startStr).toString();
        let endDate = selectInfo.event.endStr ? Temporal.PlainDate.from(selectInfo.event.endStr).toString() : startDate;

        let startTimeMinutes = 0;
        let endTimeMinutes = 0;

        if (!selectInfo.event.allDay) {
            const startTime = Temporal.PlainTime.from(selectInfo.event.startStr).toString();
            const endTime = Temporal.PlainTime.from(selectInfo.event.endStr).toString();
            //convert time to minutes after 0
            startTimeMinutes = getMinutesAfterMidnight(startTime);
            endTimeMinutes = getMinutesAfterMidnight(endTime);
        } else {
            endDate = Temporal.PlainDate.from(selectInfo.event.endStr).subtract({days: 1}).toString();
            endTimeMinutes = 24 * 60 - 1; //set end time to 11:59 PM
        }
        setSelectedDate(startDate)
        setSelectedEndDate(endDate)
        setEndTime(endTimeMinutes)
        setStartTime(startTimeMinutes)

        const daysBetween = Temporal.PlainDate.from(startDate).until(endDate).days
        setDateList(createDateList(startDate, daysBetween))
        const currentView = selectInfo.view.type;
        if (currentView === 'dayGridMonth' || currentView === "monthGridYear") {
            selectInfo.view.calendar.unselect()

        }
        //display info: description
        setDescription(selectInfo.event.extendedProps.description)
        //display info: location TODO


    }

    function handleEvents() {
        //    console.log("event")
    }

// ------------------------------------------------
// render
// ------------------------------------------------

    return (
        <div className={`app ${isSidebar ? '' : 'app-sidebar-collapsed'}`}>
            {/* determine layout ratio depending on if sidebar is here*/}
            <div className='calendar-main'>
                <FullCalendar
                    ref={calendarComponentRef}
                    plugins={[
                        themePlugin,
                        dayGridPlugin,
                        timeGridPlugin,
                        multiMonthPlugin,
                        interactionPlugin

                    ]}
                    initialView="scrollingMonth"

                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'currentMonthTitle',
                        right: 'timeGridDay,timeGridWeek,scrollingMonth,multiMonthYear'
                    }}
                    views={{ //custom scrollable month view
                        scrollingMonth: {
                            type: 'multiMonth',
                            visibleRange: (currentDate) => {
                                const start = new Date(currentDate)
                                start.setDate(1)
                                start.setMonth(start.getMonth() - 6)

                                const end = new Date(currentDate)
                                end.setDate(1)
                                end.setMonth(end.getMonth() + 7)

                                return {start, end}
                            },
                            dateIncrement: {months: 1},
                            multiMonthMaxColumns: 1
                        }
                    }} buttons={{ //rename scrollingmonth button
                    scrollingMonth: {
                        text: 'Month'
                    }
                }} toolbarElements={{
                    currentMonthTitle: () => (
                        <span className="calendar-toolbar-title">
                         {visibleMonthTitle}
                        </span>
                    )
                }}
                    editable={true} selectMinDistance={10}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    singleMonthClass={(monthInfo) => { //fix small visual bug
                        return monthInfo.multiMonthColumns === 0
                            ? 'year-month-measuring'
                            : ''
                    }}
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
                    events={fetchCalendarEvents}
                />
            </div>
            {deletePopupUndo && (
                <div className="delete-undo" role="status" aria-live="polite">
                    <span className="delete-undo__message">Event deleted</span>
                    <button className="delete-undo__button" type="button" onClick={undoDelete}>
                        Undo
                    </button>
                </div>
            )}
            {isPopOpen && (
                <Popup //passing info into popup
                    isOpen={isPopOpen}
                    onClose={closePopup}
                    position={popupPos}
                    startDate={selectedDate}
                    endDate={selectedEndDate}
                    dateList={dateList}
                    initialStartTime={startTime}
                    initialEndTime={endTime}
                    titleText={title}
                    descriptionText={description}
                    id={id}
                    allDay={allDay}
                    endTimeMod={false}
                    onEventsChanged={refreshCalendar}
                    deleteEvent={startDeleteTimer}

                />)}
            <Sidebar isOpen={isSidebar} onClose={closeBigBar}
            />
            <MinimizedBar isOpen={isMiniBar} onClose={openBigBar}
            />
        </div>
    )

}
