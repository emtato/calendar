import {useState, type CSSProperties} from 'react'
import {useEffect} from "react";

const CALENDAR_OPTIONS = [
    {value: 'default', label: 'Default', color: '#6F5FA7'},
    {value: 'work', label: 'Work', color: '#4285f4'},
    {value: 'personal', label: 'Personal', color: '#34a853'},
]

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
}

export default function Popup({isOpen, onClose, position}: PopupInfo) {
    const [calendarType, setCalendarType] = useState('default')
    const selectedCalendar = CALENDAR_OPTIONS.find(
        (calendar) => calendar.value === calendarType
    ) ?? CALENDAR_OPTIONS[0]

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
                                <div>Tuesday, July 7 – Tuesday, July 7</div>
                                <div className="secondary-text">Does not repeat</div>
                            </div>
                            <button className="outline-button">Add time</button>
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

