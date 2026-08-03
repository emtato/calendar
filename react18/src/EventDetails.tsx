import React, {useState, type CSSProperties, useRef} from 'react'
import {useEffect} from "react";
import {Temporal} from 'temporal-polyfill'
import {simpleTimeLocationExtractor} from "./utils/simple_time_location_extractor";
import {saveCalendarEvent, deleteCalendarEvent, getCalendarEventById} from "./api/eventsAPI";
import TimeComboBox from "./components/TimeComboBox";
import {CalendarEvent} from "../../backend/src/domain/calendar-event";

// ----------------------------------------------------
// Configuration
// ----------------------------------------------------

const CALENDAR_OPTIONS = [
    {value: 'default', label: 'Default', color: '#6F5FA7'},
    {value: 'work', label: 'Work', color: '#4285f4'},
    {value: 'personal', label: 'Personal', color: '#34a853'},
]

const MINUTES_PER_DAY = 24 * 60
const DEFAULT_START_TIME = 9 * 60
const DEFAULT_END_TIME = 10 * 60

// ----------------------------------------------------
// Time utils
// ----------------------------------------------------

function generateTimeOptions(startMinutes: number, endMinutes: number, interval: number) {
    const times: number[] = []
    for (let minutes = startMinutes; minutes <= endMinutes; minutes += interval) {
        times.push(minutes)
    }
    return times
}

function getNextFullHour(minutesAfterMidnight: number) {
    const nextFullHour = (Math.floor(minutesAfterMidnight / 60) + 1) * 60
    return Math.min(nextFullHour, MINUTES_PER_DAY)
}

function getAmPm(minutesAfterMidnight: number): 'AM' | 'PM' {
    const normalizedMinutes = minutesAfterMidnight % MINUTES_PER_DAY
    return normalizedMinutes < 12 * 60 ? 'AM' : 'PM'
}

function toggleAmPm(minutesAfterMidnight: number) {

    const normalizedMinutes = minutesAfterMidnight % MINUTES_PER_DAY
    if (normalizedMinutes < 12 * 60) {
        return normalizedMinutes + 12 * 60
    }
    return normalizedMinutes - 12 * 60
}

// ----------------------------------------------------
// Component prop types
// ----------------------------------------------------

interface PopupInfo { // describes the information the component expects
    /*
    isOpen: whether it should appear.
    onClose: a function it can call when the user presses Cancel.
     */
    isOpen: boolean
    onClose: () => void
    position: {
        x: number; y: number
    }
    startDate: string;
    endDate: string;
    dateList: string[];
    initialStartTime: number;
    initialEndTime: number;
    titleText: string;
    descriptionText: string;
    id: string;
    allDay: boolean;
    endTimeMod: boolean
    onEventsChanged: () => void

}

interface SidebarInfo {
    /*
    isOpen: whether it should appear.
    onClose: a function it can call when the user presses Cancel.
     */
    isOpen: boolean
    onClose: () => void
}

// ====================================================
// Event popup
// ====================================================

export default function Popup({
                                  isOpen, onClose, position, startDate, endDate, dateList, initialStartTime,
                                  initialEndTime, titleText, descriptionText, id, allDay, endTimeMod, onEventsChanged,
                              }: PopupInfo) {
    // ------------------------------------------------
    // State and refs
    // ------------------------------------------------

    const [calendarType, setCalendarType] = useState('default')
    const [startTime, setStartTime] = useState(initialStartTime)
    const [endTime, setEndTime] = useState(initialEndTime)
    const [selectedStartDate, setSelectedStartDate] = useState(startDate)
    const [selectedEndDate, setSelectedEndDate] = useState(endDate)
    const [location, setLocation] = useState('')
    const [title, setTitle] = useState(titleText)
    const [allday, setAllday] = useState(allDay)
    const [eventID, setEventID] = useState(id)
    const [description, setDescription] = useState(descriptionText)
    const [endTimeModified, setEndTimeModified] = useState(endTimeMod)
    const [locationModified, setLocationModified] = useState(false)

    const titleCleanupTimer = useRef<ReturnType<typeof setTimeout> | null>(null); //timer to remove detected time from title


    //  const [startTimeModified, setStartTimeModified] = useState(false)//flag to check time changed manually -> overrides automatic time set from title analysis

    // ------------------------------------------------
    // Derived values
    // ------------------------------------------------

    const selectedCalendar = CALENDAR_OPTIONS.find(
        (calendar) => calendar.value === calendarType
    ) ?? CALENDAR_OPTIONS[0]

    calcPopPosition()
    const startTimeOptions = generateTimeOptions(0, MINUTES_PER_DAY - 30, 30)

    let endTimeOptions = []
    if (selectedStartDate < selectedEndDate) {
        endTimeOptions = generateTimeOptions(0, MINUTES_PER_DAY, 15)
    } else {
        const firstEndTime = Math.ceil(startTime / 15) * 15
        endTimeOptions = generateTimeOptions(firstEndTime, MINUTES_PER_DAY, 15)
    }
    if (endTimeOptions[endTimeOptions.length - 1] !== MINUTES_PER_DAY) {
        endTimeOptions.push(MINUTES_PER_DAY)
    }

    // ------------------------------------------------
    // Popup positioning
    // ------------------------------------------------

    //calculate popup position
    function calcPopPosition() {
        const windowX = window.innerWidth
        const windowY = window.innerHeight
        let desiredX = position.x + 40
        let desiredY = position.y - 120

        const popupwdith = 0.30 * windowX
        const popupHeight = 0.55 * windowY

        const XrightEdge = desiredX + popupwdith
        const YBottomEdge = desiredY + popupHeight


        if (XrightEdge > windowX) {
            //work backwards to calculate actual starting point
            //desiredX = windowX-windowX*0.28 - 40
            desiredX = windowX * 0.70 - 45
            position.x = desiredX
        }
        if (YBottomEdge > windowY) {
            desiredY = windowY * 0.45 + 115
            position.y = desiredY
        }
    }

    // ------------------------------------------------
    // Input and title handlers
    // ------------------------------------------------

    // function handleUserTimeSpecification(hours: string, minutes: string, AMPM: string) {
    //     //hours, minutes will be separate text fields
    //     //AMPM will be a toggle that changes upon clicked
    //     //these 3 fields will occupy the same space as the dropdown selected display
    //     //TODO: allow input of 24h time. if user's hour is 13 or more, it removes the AMPM toggle
    //     let nextStartTime = Number(hours) * 60 + Number(minutes)
    //     if (AMPM === "PM" && hours != "12") {
    //         nextStartTime += 12 * 60
    //     }
    //     setStartTime(nextStartTime)
    //     if (selectedStartDate == selectedEndDate) {
    //         const defaultEndTime = getNextFullHour(nextStartTime)
    //         setEndTime(defaultEndTime)
    //     }
    // }

    function handleTitleInputChange([returnTime, returnLocation, returnTitle]: [string, string, string]) {
        if (titleCleanupTimer.current !== null) {
            clearTimeout(titleCleanupTimer.current);
            titleCleanupTimer.current = null;
        }
        if (returnTime !== "") {
            const [hours, minutes] = returnTime.split(":").map(Number);

            const nextStartTime = hours * 60 + minutes;

            handleStartTimeChange(nextStartTime);
        }

        if (returnLocation != "") {
            //TODO
        }

        titleCleanupTimer.current = setTimeout(() => {
            setTitle(returnTitle);
            titleCleanupTimer.current = null;
        }, 967);
    }

    // ------------------------------------------------
    // Time handlers
    // ------------------------------------------------

// process end time selection
//     function checkTime(time: string) {
//         const selectedTime = Number(time)
//         let nextEndTime = selectedTime
//         if (selectedEndDate == selectedStartDate) {
//             nextEndTime = Math.min(Math.max(Number(time), startTime), MINUTES_PER_DAY)
//         }
//         setEndTime(nextEndTime)
//         if (!selectedStartDate) {
//             return
//         }
//         if (selectedTime % MINUTES_PER_DAY === 0 && selectedEndDate && selectedTime !== 0) { //if midnight
//             const nextEndDate = Temporal.PlainDate.from(selectedEndDate).add({days: 1}).toString() //add 1 day to end date
//             setSelectedEndDate(nextEndDate)
//             setEndTime(0)
//         }
//     }

    function handleStartTimeChange(nextStartTime: number) {
        // setStartTimeModified(true)
        console.log("start time changed to " + nextStartTime)
        let defaultEndTime = 0
        if (nextStartTime % 15 != 0) {
            defaultEndTime = getNextFullHour(nextStartTime);
        } else {
            defaultEndTime = Math.min(nextStartTime + 60, MINUTES_PER_DAY)
        }
        setStartTime(nextStartTime)
        //conditions for modifying end time:
        /*
        1. if end time was never modified AND its same day
        2. if end time is earlier than start time AND its same day
         */
        if ((selectedStartDate == selectedEndDate && !endTimeModified) || (endTime < nextStartTime && selectedStartDate == selectedEndDate)) {
            setEndTime(defaultEndTime)
        }

        if (defaultEndTime % MINUTES_PER_DAY === 0 && selectedEndDate && selectedStartDate === selectedEndDate && (!endTimeModified || endTime < nextStartTime)) {
            const nextEndDate = Temporal.PlainDate.from(selectedEndDate).add({days: 1}).toString()
            setSelectedEndDate(nextEndDate)
            setEndTime(0)
        }
    }

    function handleEndTimeChange(nextEndTime: number) {
        setEndTimeModified(true)
        let nextEndDate = selectedEndDate
        if (nextEndTime == 24 * 60) {
            nextEndTime = 0
            nextEndDate = Temporal.PlainDate.from(selectedEndDate).add({days: 1}).toString()
            setSelectedEndDate(nextEndDate)
        }
        setEndTime(nextEndTime);

        if (nextEndTime < startTime && selectedStartDate == nextEndDate) {
            setStartTime(nextEndTime)
        }
    }

    // ------------------------------------------------
    // Popup lifecycle and persistence
    // ------------------------------------------------

    function closePopup() {
        setStartTime(DEFAULT_START_TIME)
        setEndTime(DEFAULT_END_TIME)
        setTitle("")
        setDescription("")
        setEventID("")
        setAllday(false)
        setEndTimeModified(false);
        onClose();
    }

    async function deleteEvent() {
        await deleteCalendarEvent(id)
        onEventsChanged(); //refresh calendar events
        closePopup()
    }

    async function saveEvent() {
        //already given variables:
        //title is title
        //startTime is event starting time
        //endTime is  event ending time
        //selectedStartDate is event start date
        //selectedEndDate is event end date
        //allDay is event alldayness :3
        //description is description
        const location = "location"
        const event = {
            id: id, //id is "" by default, and passed in by calendarApp if clicking on a prexisting event
            title: title,
            startTime: startTime,
            endTime: endTime,
            startDate: selectedStartDate,
            endDate: selectedEndDate,
            allDay: allday,
            extendedProps: {
                location: location,
                description: description,
            }
        }
        console.log("saving event with id", id)
        console.log(event)
        await saveCalendarEvent(event)
        onEventsChanged(); //refresh calendar events
        closePopup()
    }

    // ------------------------------------------------
    // Effects
    // ------------------------------------------------

    useEffect(() => { // sync the popup dates when CalendarApp opens it with a new date
        if (isOpen) {
            setSelectedStartDate(startDate)
            setSelectedEndDate(endDate)
        }
    }, [isOpen, startDate, endDate])

    useEffect(() => {
        if (isOpen) {
            setSelectedStartDate(startDate);
            setSelectedEndDate(endDate);
            setStartTime(initialStartTime);
            setEndTime(initialEndTime);
            setTitle(titleText);
            setDescription(descriptionText);
            setAllday(allDay);
            setEventID(id);
        }
    }, [
        isOpen, startDate, endDate, initialStartTime, initialEndTime, titleText, descriptionText, allDay, id,
    ]);

    // ------------------------------------------------
    // Render
    // ------------------------------------------------

    if (!isOpen) {
        return null
    }

    return (

        <div className="popup-overlay">
            <div

                style={{
                    position: "fixed",
                    left: position.x + 40,
                    top: position.y - 120,
                }}
            >

                <div
                    className="event-popup"
                    style={{'--event-color': selectedCalendar.color} as CSSProperties}
                >
                    <button className="icon-button drag-button" type="button" aria-label="Move popup">☰</button>
                    {/* TODO */}
                    <button
                        className="icon-button close-button"
                        type="button"
                        aria-label="Close popup"
                        onClick={closePopup}
                    >
                        ×
                    </button>
                    <div className="event-content">
                        <input
                            value={title}
                            className="title-input"
                            placeholder="Add title, time/location"
                            onInput={(event) => {
                                const input = event.currentTarget.value
                                setTitle(input);
                                //temporarily disable time modification detection
                                const startTimeModified = false
                                handleTitleInputChange(simpleTimeLocationExtractor(input, startTimeModified, locationModified))
                            }}
                        />
                        <div className="form-row">
                            <span className="row-icon">◷</span>
                            <div className="row-content">
                                {/*
                                <input
                                value={dateText}
                                onChange={(event) => setDateText(event.target.value)}
                                />
                                */}
                                <div className="date-range">
                                    <select
                                        className="date-input" value={selectedStartDate}
                                        onChange={(event) => {
                                            const nextStartDate = event.target.value
                                            const nextEndDate = nextStartDate >= selectedEndDate
                                                //only update end date if start date is after end date
                                                ? nextStartDate
                                                : selectedEndDate

                                            setSelectedStartDate(nextStartDate)
                                            setSelectedEndDate(nextEndDate)
                                            if (nextStartDate == nextEndDate && endTime < startTime) {
                                                setEndTime(startTime)
                                            }
                                        }}
                                    >
                                        {dateList.map((date) => (
                                            <option key={date} value={date}>
                                                {date}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="range-separator">-</span>
                                    <select
                                        className="date-input end-date-input"
                                        value={selectedEndDate}
                                        onChange={(event) => {
                                            const nextEndDate = event.target.value
                                            setSelectedEndDate(nextEndDate)
                                            if (nextEndDate < selectedStartDate) {
                                                setSelectedStartDate(event.target.value)
                                            }
                                            const nextStartDate = nextEndDate < selectedStartDate //use updated start date info
                                                ? nextEndDate
                                                : selectedStartDate;
                                            if (nextStartDate == nextEndDate && endTime < startTime) {
                                                setEndTime(startTime)
                                            }
                                        }
                                        }>
                                        {dateList.map((date) => (
                                            <option key={date} value={date}>
                                                {date}
                                            </option>
                                        ))}
                                    </select>
                                    <label className="all-day-option">
                                        <input
                                            type="checkbox"
                                            checked={allday}
                                            onChange={(event) => {
                                                setAllday(event.target.checked);
                                            }}
                                        />
                                        <span>All day</span>
                                    </label>
                                </div>
                                <div className="date-range">
                                    <span className="time-select-with-edit">
                                        <TimeComboBox
                                            value={startTime}
                                            options={startTimeOptions}
                                            onChange={handleStartTimeChange}
                                            ariaLabel="Start time"
                                            ampm={getAmPm(startTime)}
                                        />
                                        <button
                                            className="time-period-toggle"
                                            type="button"
                                            aria-label="Toggle start time AM or PM"
                                            onClick={() => {
                                                handleStartTimeChange(toggleAmPm(startTime));
                                            }}
                                        >
                                            {getAmPm(startTime)}
                                        </button>
                                    </span>
                                    <span className="range-separator">-</span>
                                    <span className="time-select-with-edit">
                                        <TimeComboBox
                                            value={endTime}
                                            options={endTimeOptions}
                                            onChange={handleEndTimeChange}
                                            ariaLabel="End time"
                                            ampm={getAmPm(endTime)}
                                        />
                                        <button
                                            className="time-period-toggle"
                                            type="button"
                                            disabled={selectedStartDate === selectedEndDate && toggleAmPm(endTime) < startTime}
                                            aria-label="Toggle end time AM or PM"
                                            onClick={() => {
                                                setEndTimeModified(true)
                                                setEndTime((currentTime) => toggleAmPm(currentTime))
                                            }}
                                        >
                                            {getAmPm(endTime)}
                                        </button>
                                    </span>
                                </div>
                                <div className="secondary-text">Does not repeat</div>
                            </div>
                        </div>
                        <div className="form-row">
                            <span className="row-icon">♙</span>
                            <span>Add guests</span>
                        </div>
                        <div className="form-row">
                            <span className="row-icon row-icon-shift-left">⌖</span>
                            <span>Add location</span>
                        </div>
                        <div className="form-row">
                            <span className="row-icon row-icon-shift-left">▣</span>
                            <label className="calendar-select">
                                <select
                                    aria-label="Calendar type"
                                    value={calendarType}
                                    onChange={(event) => setCalendarType(event.target.value)}
                                >
                                    {CALENDAR_OPTIONS.map((calendar) => (
                                        <option key={calendar.value} value={calendar.value}>
                                            {calendar.label}
                                        </option>
                                    ))}
                                </select>
                                <span
                                    className="calendar-color"
                                    style={{backgroundColor: selectedCalendar.color}}
                                />
                                <span className="calendar-arrow" aria-hidden="true">▾</span>
                            </label>
                        </div>
                        <div className="form-row">
                            <span className="row-icon row-icon-shift-left">☰</span>
                            <input
                                value={description}
                                className="description-input"
                                placeholder="Add description"
                                onChange={(event) => setDescription(event.target.value)}
                            />
                        </div>
                    </div>
                    <div className="popup-actions">
                        <button className="delete-button"
                                onClick={deleteEvent} type="button" aria-label="Delete event">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M4 7h16"/>
                                <path d="M9 7V4h6v3"/>
                                <path d="m6 7 1 13h10l1-13"/>
                                <path d="M10 11v5M14 11v5"/>
                            </svg>
                        </button>
                        <button className="text-button">More options</button>
                        <button className="save-button"
                                onClick={saveEvent}
                        >Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}


// ====================================================
// Expanded sidebar
// ====================================================

export function Sidebar({isOpen, onClose}: SidebarInfo) {


    // ------------------------------------------------
    // Render
    // ------------------------------------------------

    if (!isOpen) {
        return null
    }

    return (
        <div className='app-sidebar'>
            <div className='sidebar-toolbar'>
                <div className='sidebar-toolbar-left'>
                    <button className='sidebar-icon-button' type='button' aria-label='Close sidebar' onClick={onClose}>
                        <svg viewBox='0 0 24 24' aria-hidden='true'>
                            <path d='M5 12h14M13 6l6 6-6 6'/>
                        </svg>
                    </button>
                </div>
                <div className='sidebar-toolbar-right'>
                    <button className='sidebar-icon-button' type='button' aria-label='Search'>
                        <svg viewBox='0 0 24 24' aria-hidden='true'>
                            <circle cx='11' cy='11' r='6.5'/>
                            <path d='m16 16 4 4'/>
                        </svg>
                    </button>
                    <button className='sidebar-icon-button' type='button' aria-label='Add'>
                        <svg viewBox='0 0 24 24' aria-hidden='true'>
                            <path d='M12 5v14M5 12h14'/>
                        </svg>
                    </button>
                    <button className='sidebar-icon-button' type='button' aria-label='Settings'>
                        <svg viewBox='0 0 24 24' aria-hidden='true'>
                            <circle cx='12' cy='12' r='3'/>
                            <path
                                d='M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.12.37.34.7.65.93.3.23.67.36 1.05.38h.09v4h-.09A1.7 1.7 0 0 0 19.4 15Z'/>
                        </svg>
                    </button>
                </div>
            </div>
            <div className='app-sidebar-section'>
                <h2>Instructions</h2>
                <ul>
                    <li>Select dates and you will be prompted to create a new event</li>
                    <li>Drag, drop, and resize events</li>
                    <li>Click an event to delete it</li>
                </ul>
            </div>
            <div className='app-sidebar-section'>

            </div>

        </div>
    )
}

// ====================================================
// Minimized sidebar
// ====================================================

//onclose will js be closing this small bar -> opening big bar
export function MinimizedBar({isOpen, onClose}: SidebarInfo) {

    // ------------------------------------------------
    // Render
    // ------------------------------------------------

    if (!isOpen) {
        return null
    }

    return (
        <aside className="sidebar sidebar--minimized" aria-label="Calendar sidebar">
            <button className="sidebar-icon-button sidebar-expand-button"
                    type="button"
                    aria-label="Expand sidebar"
                    onClick={onClose}
            >
                ←
            </button>

            <nav className="sidebar-icon-list" aria-label="Sidebar tools">
                <button className="sidebar-icon-button" type="button" aria-label="Search">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="11" cy="11" r="6.5"/>
                        <path d="m16 16 4 4"/>
                    </svg>
                </button>

                <button className="sidebar-icon-button" type="button" aria-label="Add">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                </button>

                <button className="sidebar-icon-button" type="button" aria-label="Settings">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="3"/>
                        <path
                            d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.12.37.34.7.65.93.3.23.67.36 1.05.38h.09v4h-.09A1.7 1.7 0 0 0 19.4 15Z"/>
                    </svg>
                </button>
            </nav>
        </aside>
    )
}
