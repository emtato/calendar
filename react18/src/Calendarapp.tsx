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

import React, {useState} from 'react'
import Popup, {MinimizedBar, Sidebar} from './EventDetails'

export default function CalendarApp() {
    const [isPopOpen, setIsPopOpen] = useState(false)
    const [popupPos, setPopupPos] = useState({x: 0, y: 0});

    const [isSidebar, setSidebar] = useState(true)
    const [isMiniBar, setMinibar] = useState(false)

    function closeBigBar() {
        setSidebar(false)
        setMinibar(true)
    }

    function openBigBar() {
        setSidebar(true)
        setMinibar(false)
    }

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

    function renderSidebar() {
        return (
            <div className='demo-app-sidebar'>
                <div className='sidebar-toolbar'>
                    <div className='sidebar-toolbar-left'>
                        <button className='sidebar-icon-button' type='button' aria-label='Close sidebar'>
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
                <div className='demo-app-sidebar-section'>
                    <h2>Instructions</h2>
                    <ul>
                        <li>Select dates and you will be prompted to create a new event</li>
                        <li>Drag, drop, and resize events</li>
                        <li>Click an event to delete it</li>
                    </ul>
                </div>
                <div className='demo-app-sidebar-section'>
                </div>
            </div>
        )
    }

    return (
        <div className='app'>
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
                    dateClick={handleDateClick}
                    initialEvents={INITIAL_EVENTS} // alternatively, use the `events` setting to fetch from a feed
                    select={handleDateDrag}
                    // eventContent={renderEventContent} // custom render function
                    eventClick={handleEventClick}
                    eventsSet={handleEvents} // called after events are initialized/added/changed/removed
                />
            </div>
            <Popup
                isOpen={isPopOpen}
                onClose={() => setIsPopOpen(false)}
                position={popupPos}

            />
            <Sidebar isOpen={isSidebar} onClose={closeBigBar}
            />
            <MinimizedBar isOpen={isMiniBar} onClose={openBigBar}
            />
        </div>
    )

}
