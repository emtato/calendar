import React, {useState, type CSSProperties} from 'react'
import {useEffect} from "react";

const CALENDAR_OPTIONS = [
    {value: 'default', label: 'Default', color: '#6F5FA7'},
    {value: 'work', label: 'Work', color: '#4285f4'},
    {value: 'personal', label: 'Personal', color: '#34a853'},
]

const MINUTES_PER_DAY = 24 * 60
const DEFAULT_START_TIME = 9 * 60
const DEFAULT_END_TIME = 10 * 60

function generateTimeOptions(startMinutes: number, endMinutes: number, interval: number) {
    const times: number[] = []

    for (let minutes = startMinutes; minutes <= endMinutes; minutes += interval) {
        times.push(minutes)
    }

    return times
}

function formatTime(minutesAfterMidnight: number) {
    if (minutesAfterMidnight === MINUTES_PER_DAY) {
        return '12:00 AM (next day)'
    }

    const hour24 = Math.floor(minutesAfterMidnight / 60)
    const minutes = minutesAfterMidnight % 60
    const hour12 = hour24 % 12 || 12
    const period = hour24 < 12 ? 'AM' : 'PM'

    return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`
}

const START_TIME_OPTIONS = generateTimeOptions(0, MINUTES_PER_DAY - 30, 30)

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
}

interface SidebarInfo {
    /*
    isOpen: whether it should appear.
    onClose: a function it can call when the user presses Cancel.
     */
    isOpen: boolean
    onClose: () => void
}

export default function Popup({isOpen, onClose, position, startDate, dateList}: PopupInfo) {
    const [calendarType, setCalendarType] = useState('default')
    const [startTime, setStartTime] = useState(DEFAULT_START_TIME)
    const [endTime, setEndTime] = useState(DEFAULT_END_TIME)

    const selectedCalendar = CALENDAR_OPTIONS.find(
        (calendar) => calendar.value === calendarType
    ) ?? CALENDAR_OPTIONS[0]

    const endTimeOptions = generateTimeOptions(startTime + 15, MINUTES_PER_DAY, 15)

    function handleStartTimeChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const nextStartTime = Number(event.target.value)
        const oneHourLater = Math.min(nextStartTime + 60, MINUTES_PER_DAY)

        setStartTime(nextStartTime)
        setEndTime(oneHourLater)
    }

    // detect key presses
    useEffect(() => { //run code after rendereing compoent
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]); //dependency array (rerun only if onclose changes


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
                        onClick={onClose}
                    >
                        ×
                    </button>
                    <div className="event-content">
                        <input
                            className="title-input"
                            placeholder="Add title, time/location"
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
                                    <select className="date-input" defaultValue={startDate}>
                                        {dateList.map((date) => (
                                            <option key={date} value={date}>
                                                {date}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="range-separator">-</span>
                                    <select className="date-input" defaultValue={startDate}>
                                        {dateList.map((date) => (
                                            <option key={date} value={date}>
                                                {date}
                                            </option>
                                        ))}
                                    </select></div>
                                <div className="date-range">
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
                                    <span className="range-separator">-</span>
                                    <select
                                        className="time-input"
                                        aria-label="End time"
                                        value={endTime}
                                        onChange={(event) => setEndTime(Number(event.target.value))}
                                    >
                                        {endTimeOptions.map((minutes) => (
                                            <option key={minutes} value={minutes}>
                                                {formatTime(minutes)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="secondary-text">Does not repeat</div>
                            </div>
                            <label className="all-day-option">
                                <input type="checkbox"/>
                                <span>All day</span>
                            </label>
                        </div>
                        <div className="form-row">
                            <span className="row-icon">♙</span>
                            <span className="secondary-text">Add guests</span>
                        </div>
                        <div className="form-row">
                            <span className="row-icon">⌖</span>
                            <span className="secondary-text">Add location</span>
                        </div>
                        <div className="form-row">
                            <span className="row-icon">▣</span>
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
                            <span className="row-icon">☰</span>
                            <span className="secondary-text">Add description</span>
                        </div>
                    </div>
                    <div className="popup-actions">
                        <button className="text-button">More options</button>
                        <button className="save-button">Save</button>
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
                    🔍
                </button>

                <button className="sidebar-icon-button" type="button" aria-label="Add">
                    ＋
                </button>

                <button className="sidebar-icon-button" type="button" aria-label="Settings">
                    ⚙️
                </button>
            </nav>
        </aside>
    )
}
