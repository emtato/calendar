import React, {useState, type CSSProperties, useRef} from 'react'
import {useEffect} from "react";
import {Temporal} from 'temporal-polyfill'
import {simpleTimeLocationExtractor} from "./utils/simple_time_location_extractor";
import {saveCalendarEvent, deleteCalendarEvent, getCalendarEventById} from "./api/eventsAPI";

const CALENDAR_OPTIONS = [
    {value: 'default', label: 'Default', color: '#6F5FA7'},
    {value: 'work', label: 'Work', color: '#4285f4'},
    {value: 'personal', label: 'Personal', color: '#34a853'},
]

const MINUTES_PER_DAY = 24 * 60
const DEFAULT_START_TIME = 9 * 60
const DEFAULT_END_TIME = 10 * 60


function generateTimeOptions(startMinutes: number, endMinutes: number, interval: number, customTime?: number) {
    const times: number[] = []
    let addedCustomAlready = false
    for (let minutes = startMinutes; minutes <= endMinutes; minutes += interval) {
        times.push(minutes)
        if (customTime) {
            if (minutes + interval > customTime && !addedCustomAlready) {
                times.push(customTime)
                addedCustomAlready = true
            }

        }
    }

    return times
}

//TODO: make dropdown menu pretty with times going in a grid horizontally then vertically
//11:00 11:30 12:00 12:30
//1:00  1:30  2:00  2:30 etc

function formatTime(minutesAfterMidnight: number) {
    if (minutesAfterMidnight === 24 * 60) {
        return '12:00 AM';
    }

    const hour24 = Math.floor(minutesAfterMidnight / 60)
    const minutes = minutesAfterMidnight % 60
    const hour12 = hour24 % 12 || 12
    const period = hour24 < 12 ? 'AM' : 'PM'

    return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`
}

let START_TIME_OPTIONS = generateTimeOptions(0, MINUTES_PER_DAY - 30, 30)

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
    generateSpecificTimeOption: number[];
    titleText: string;
    descriptionText: string;
    id: string;
    allDay: boolean;

}

interface SidebarInfo {
    /*
    isOpen: whether it should appear.
    onClose: a function it can call when the user presses Cancel.
     */
    isOpen: boolean
    onClose: () => void
}

export default function Popup({
                                  isOpen,
                                  onClose,
                                  position,
                                  startDate,
                                  endDate,
                                  dateList,
                                  initialStartTime,
                                  initialEndTime,
                                  generateSpecificTimeOption,
                                  titleText,
                                  descriptionText,
                                  id,
                                  allDay,
                              }: PopupInfo) {
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
    const [timeOptionStart, setTimeOptionStart] = useState(generateSpecificTimeOption[0])
    const [timeOptionEnd, setTimeOptionEnd] = useState(generateSpecificTimeOption[1])

    const [endTimeModified, setEndTimeModified] = useState(false)
    //  const [startTimeModified, setStartTimeModified] = useState(false)//flag to check time changed manually -> overrides automatic time set from title analysis

    const [locationModified, setLocationModified] = useState(false)

    const titleCleanupTimer = useRef<ReturnType<typeof setTimeout> | null>(null); //timer to remove detected time from title
    const selectedCalendar = CALENDAR_OPTIONS.find(
        (calendar) => calendar.value === calendarType
    ) ?? CALENDAR_OPTIONS[0]

    calcPopPosition()
    let endTimeOptions = []
    if (selectedStartDate < selectedEndDate) {
        endTimeOptions = generateTimeOptions(0, MINUTES_PER_DAY, 15, timeOptionEnd)
    } else {
        endTimeOptions = generateTimeOptions(startTime, MINUTES_PER_DAY, 15, timeOptionEnd)
    }
    if (endTimeOptions[endTimeOptions.length - 1] !== MINUTES_PER_DAY) {
        endTimeOptions.push(MINUTES_PER_DAY)
    }
    if (timeOptionStart != 0) {
        START_TIME_OPTIONS = generateTimeOptions(0, MINUTES_PER_DAY - 30, 30, timeOptionStart)
    }

    function handleTitleInputChange([returnTime, returnLocation, returnTitle]: [string, string, string]) {
        if (titleCleanupTimer.current !== null) {
            clearTimeout(titleCleanupTimer.current);
            titleCleanupTimer.current = null;
        }
        if (returnTime != "") {
            console.log("time received " + returnTime)
            const [hours, minutes] = returnTime.split(":").map(Number)

            START_TIME_OPTIONS = generateTimeOptions(0, MINUTES_PER_DAY - 30, 30)
            const nextStartTime = hours * 60 + minutes
            if (nextStartTime % 30 !== 0) { //chosen time isnt a multiple of 30 minutes
                for (let i = 0; i < 49; i++) {
                    if (nextStartTime - START_TIME_OPTIONS[i] < 30) { //were in the endgame now bitch
                        i++
                        START_TIME_OPTIONS.splice(i, 0, nextStartTime)
                        break
                    }
                }
            }
            setStartTime(nextStartTime)
            const oneHourLater = Math.min(nextStartTime + 60, MINUTES_PER_DAY)

            if (selectedStartDate == selectedEndDate) {
                setEndTime(oneHourLater)
            }
        }
        if (returnLocation != "") {
            //TODO
        }

        titleCleanupTimer.current = setTimeout(() => {
            setTitle(returnTitle);
            titleCleanupTimer.current = null;
        }, 967);
    }

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

    // process end time selection
    function checkTime(time: string) {
        const selectedTime = Number(time)
        let nextEndTime = selectedTime
        if (selectedEndDate == selectedStartDate) {
            nextEndTime = Math.min(Math.max(Number(time), startTime), MINUTES_PER_DAY)
        }
        setEndTime(nextEndTime)
        if (!selectedStartDate) {
            return
        }
        if (selectedTime % MINUTES_PER_DAY === 0 && selectedEndDate && selectedTime !== 0) { //if midnight
            const nextEndDate = Temporal.PlainDate.from(selectedEndDate).add({days: 1}).toString() //add 1 day to end date
            setSelectedEndDate(nextEndDate)
            setEndTime(0)
        }
    }

    function handleStartTimeChange(event: React.ChangeEvent<HTMLSelectElement>) {
        // setStartTimeModified(true)
        const nextStartTime = Number(event.target.value)
        const oneHourLater = Math.min(nextStartTime + 60, MINUTES_PER_DAY)

        setStartTime(nextStartTime)
        //conditions for modifying end time:
        /*
        1. if end time was never modified AND its same day
        2. if end time is earlier than start time AND its same day
         */
        if ((selectedStartDate == selectedEndDate && !endTimeModified) || (endTime < startTime && selectedStartDate == selectedEndDate)) {
            setEndTime(oneHourLater)
        }

        if (oneHourLater % MINUTES_PER_DAY === 0 && selectedEndDate) {
            const nextEndDate = Temporal.PlainDate.from(selectedEndDate).add({days: 1}).toString()
            setSelectedEndDate(nextEndDate)
            setEndTime(0)
        }
    }

    function closePopup() {
        setStartTime(DEFAULT_START_TIME)
        setEndTime(DEFAULT_END_TIME)
        setTitle("")
        setDescription("")
        setEventID("")
        setAllday(false)
        onClose();
    }

    useEffect(() => { // sync the popup dates when CalendarApp opens it with a new date
        if (isOpen) {
            setSelectedStartDate(startDate)
            setSelectedEndDate(endDate)
        }
    }, [isOpen, startDate, endDate])

    // detect key presses
    useEffect(() => { //run code after rendereing compoent
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                closePopup()
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]); //dependency array (rerun only if onclose changes

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
        isOpen,
        startDate,
        endDate,
        initialStartTime,
        initialEndTime,
        titleText,
        descriptionText,
        allDay,
        id,
    ]);

    useEffect(() => {
        setTimeOptionStart(generateSpecificTimeOption[0])
        setTimeOptionEnd(generateSpecificTimeOption[1])
    }, [generateSpecificTimeOption])

    if (!isOpen) {
        return null
    }

    function saveEvent() {
        //already given variables:
        //title is title
        //startTime is event starting time
        //endTime is  event ending time
        //selectedStartDate is event start date
        //selectedEndDate is event end date
        //allDay is event alldayness :3
        //description is description
        //TODO: implement location and description select/text inputs
        //TODO: ID impementation
        const location = "location"
        const event = {
            id: id,
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
        saveCalendarEvent(event)
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
                                    <select
                                        className="time-input"
                                        aria-label="Start time"
                                        value={startTime}
                                        onChange={handleStartTimeChange}
                                    >
                                        {START_TIME_OPTIONS.map((minutes) => (
                                            <option key={minutes} value={minutes}>
                                                {formatTime(minutes)}
                                            </option>
                                        ))}
                                    </select>
                                        <svg className="time-edit-icon" viewBox="0 0 24 24" aria-hidden="true">
                                            <path
                                                d="m4 20 4.2-1 10.6-10.6a1.8 1.8 0 0 0 0-2.6l-.6-.6a1.8 1.8 0 0 0-2.6 0L5 15.8 4 20Z"/>
                                            <path d="m14.5 6.3 3.2 3.2"/>
                                        </svg>
                                    </span>
                                    <span className="range-separator">-</span>
                                    <span className="time-select-with-edit">
                                    <select
                                        className="time-input"
                                        aria-label="End time"
                                        value={endTime}
                                        onChange={(event) => {
                                            setEndTimeModified(true)
                                            checkTime(event.target.value)
                                        }}>
                                        {endTimeOptions.map((minutes) => (
                                            <option key={minutes} value={minutes}>
                                                {formatTime(minutes)}
                                            </option>
                                        ))}
                                    </select>
                                        <svg className="time-edit-icon" viewBox="0 0 24 24" aria-hidden="true">
                                            <path
                                                d="m4 20 4.2-1 10.6-10.6a1.8 1.8 0 0 0 0-2.6l-.6-.6a1.8 1.8 0 0 0-2.6 0L5 15.8 4 20Z"/>
                                            <path d="m14.5 6.3 3.2 3.2"/>
                                        </svg>
                                    </span>
                                </div>
                                <div className="secondary-text">Does not repeat</div>
                            </div>
                        </div>
                        <div className="form-row">
                            <span className="row-icon">♙</span>
                            <span className="secondary-text">Add guests</span>
                        </div>
                        <div className="form-row">
                            <span className="row-icon row-icon-shift-left">⌖</span>
                            <span className="secondary-text">Add location</span>
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
                        <button className="delete-button" type="button" aria-label="Delete event">
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


export function Sidebar({isOpen, onClose}: SidebarInfo) {

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);


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

//onclose will js be closing this small bar -> opening big bar
export function MinimizedBar({isOpen, onClose}: SidebarInfo) {

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
