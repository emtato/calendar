import React from 'react'
import { createRoot } from 'react-dom/client'
import CalendarApp from './Calendarapp'
import '@fontsource-variable/nunito'
import './index.css'

// @ts-ignore
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CalendarApp />
    {/* <DemoApp /> */}
  </React.StrictMode>
)
