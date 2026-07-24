import React from 'react'
import { createRoot } from 'react-dom/client'
import DemoApp from './DemoApp'
import CalendarApp from './Calendarapp'
import './index.css'

// @ts-ignore
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CalendarApp />
    {/* <DemoApp /> */}
  </React.StrictMode>
)
