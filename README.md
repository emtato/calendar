# Smart Calendar

An intent first calendar built to make planning feel faster, clearer, and more natural.

[**View the live application →**](https://calendar.ems.lol)

> **Project status:** Active development. The full stack calendar foundation is live; richer natural language scheduling, recurrence, travel intelligence, and planning assistance are being developed in stages.

## Overview

Smart Calendar is a full stack calendar application exploring a simple product question:

> What if creating an event started with what you meant, instead of a form you had to fill out?

The current release combines a responsive React calendar with a custom event editor, lightweight title interpretation, and persistent MongoDB storage. It is the foundation for a larger system that will turn natural language requests into structured, reviewable events while keeping every assumption visible and editable.

This project is also an exercise in building the difficult parts of a calendar product: date boundary semantics, multiple calendar views, interaction state, undoable operations, responsive layout, and a clean frontend/backend boundary.

## Preview

<!  
Screenshot slot 1
Recommended file: docs/screenshots/calendar overview.png
Recommended content: the complete calendar with the sidebar visible.

Replace the placeholder below with:
![Smart Calendar overview](docs/screenshots/calendar overview.png)
  >

> **Screenshot placeholder — Calendar overview**
>
> Add a wide image showing the calendar, view controls, and scheduling sidebar.

<!  
Screenshot slot 2
Recommended file: docs/screenshots/event editor.png
Recommended content: an event selected with the editor open.

Replace the placeholder below with:
![Smart Calendar event editor](docs/screenshots/event editor.png)
  >

> **Screenshot placeholder — Event editor**
>
> Add an image showing event creation, time controls, guests, location, and description.

## What works today

  Day, week, continuous month, and year views built on FullCalendar
  Click or drag across the calendar to create a draft event
  Create and edit timed, all day, single day, and multi day events
  Custom time entry with selectable values and AM/PM controls
  Event metadata for guests, location, and description
  Lightweight title interpretation for explicit 12 hour and 24 hour times, noon, and midnight
  MongoDB backed event creation, loading, updating, deletion, and restoration
  Five second undo flow after deleting an event
  Responsive calendar layout with a collapsible scheduling assistant sidebar
  Keyboard workflows, including `N` for a new event and `Escape` for closing the active surface

## Current product status

| Capability | Status |
|     |     |
| Calendar navigation and multiple views | Available |
| Manual event creation and editing | Available |
| Persistent event storage | Available |
| Undoable deletion | Available |
| Guests, location, and description | Available |
| Basic time extraction from titles | Available, expanding |
| Persisted drag/resize changes | In progress |
| Full intent interpretation and validation | Planned |
| Flexible recurrence and conflict detection | Planned |
| Travel time intelligence | Planned |
| Conversational planning assistant | Planned |

The distinction matters: the live application demonstrates the calendar and persistence foundation, while the roadmap below describes the product being built on top of it.

## Engineering highlights

### Calendar interaction model

Calendar selection, temporary draft events, editor state, and persistence refreshes are coordinated explicitly rather than hidden inside FullCalendar. This keeps user intent visible while an event is being created and prevents unsaved placeholders from becoming permanent data.

### Date and time correctness

Times are represented internally as minutes after midnight and converted at the API boundary. The application also translates between inclusive dates in the editor and FullCalendar's exclusive all day end dates. `Temporal` is used for date arithmetic rather than manual string manipulation.

### Recoverable deletion

Deletion and restoration are separate backend operations. The client temporarily retains the deleted event and offers an accessible five second Undo action, while restoration preserves the event's stable application ID.

### Layered backend

The backend separates HTTP routing, request handling, application rules, domain types, and database operations. This creates clear extension points for validation, recurrence, and AI assisted interpretation without coupling them directly to Express or MongoDB.

### Custom responsive UI

The interface extends FullCalendar with a continuous scrolling month view, custom event rendering, responsive sizing, a collapsible sidebar, and a purpose built event editor. The visual system uses scalable `em` based dimensions and a consistent muted purple palette.

## Architecture

```mermaid
flowchart LR
    UI["React + FullCalendar client"]
    Parser["Title time interpreter"]
    Routes["Express routes"]
    Controllers["HTTP controllers"]
    Service["Calendar service"]
    Storage["MongoDB storage adapter"]
    Database[(MongoDB)]

    UI   > Parser
    UI   >|REST + JSON| Routes
    Routes   > Controllers
    Controllers   > Service
    Service   > Storage
    Storage   > Database
```

### Repository layout

```text
.
├── react18/
│   ├── src/Calendarapp.tsx          # Calendar views and interaction state
│   ├── src/EventDetails.tsx        # Event editor and form behavior
│   ├── src/components/             # Reusable interface controls
│   ├── src/api/                    # REST client
│   └── src/utils/                  # Title time/location interpretation
├── backend/
│   └── src/
│       ├── routes/                 # API paths
│       ├── controllers/            # HTTP translation
│       ├── services/               # Calendar workflows
│       ├── repositories/           # MongoDB operations
│       ├── domain/                 # Shared event shapes
│       └── config/                 # Environment and database setup
└── .github/workflows/deploy.yml        # Frontend deployment workflow
```

## Technology

| Area | Tools |
|     |     |
| Frontend | React 18, TypeScript, Vite |
| Calendar UI | FullCalendar 7 |
| Date handling | Temporal polyfill |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB |
| Styling | Handwritten responsive CSS, Nunito variable font |
| Deployment | GitHub Actions and GitHub Pages for the frontend; separately hosted API |

## API surface

| Method | Endpoint | Purpose |
|     |     |     |
| `GET` | `/api/events?start=...&end=...` | Load events overlapping a date range |
| `POST` | `/api/events` | Create a new event or update an existing one |
| `POST` | `/api/events/restore` | Restore a deleted event with its original ID |
| `DELETE` | `/api/events/:id` | Delete an event |

## Run locally

### Prerequisites

  Node.js 22+
  npm
  A MongoDB database

### 1. Start the backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```dotenv
MONGODB_URI=your_mongodb_connection_string
PORT=5001
```

Then start the development server:

```bash
npm run dev
```

The API defaults to `http://localhost:5001`.

### 2. Start the frontend

In a second terminal:

```bash
cd react18
npm install
```

Create `react18/.env`:

```dotenv
VITE_SERVER_URL=http://localhost:5001
```

Then run:

```bash
npm run dev
```

Vite will print the local application URL.

### Quality checks

```bash
# Frontend
cd react18
npm run typecheck
npm run build

# Backend
cd ../backend
npm run build
```

## Product roadmap

The long term vision is an editable, intent first planning system in which AI interprets requests while deterministic application logic remains responsible for validation and scheduling decisions.

### 1. Smart event creation

  Interpret title, date, time, duration, and location from natural language
  Preview the interpreted event before saving
  Surface uncertain assumptions instead of silently guessing
  Detect basic scheduling conflicts
  Keep every generated field manually editable

### 2. Flexible recurrence and scheduling

  Expressive rules such as “every 10 days” or “the last weekday of each month”
  Exceptions and end dates
  Dynamic titles such as milestone counts and anniversaries
  Fixed versus movable events
  Automatic placement into available time windows

### 3. Location and travel intelligence

  Place autocomplete and saved locations
  Walking, cycling, transit, and driving estimates
  Travel feasibility warnings between events
  Suggested departure buffers and optional travel blocks

### 4. Planning assistant

  Plan or rebalance complete days
  Respect fixed commitments, opening hours, travel, meals, and breaks
  Explain scheduling decisions
  Support conversational edits while preserving user control

## Product principles

  Reduce planning friction before adding feature volume.
  Use AI to interpret intent, not to make irreversible decisions.
  Keep recurrence, validation, travel calculations, and scheduling deterministic.
  Show uncertainty instead of hiding assumptions.
  Keep every suggestion editable.
  Make each milestone a polished, deployable product.

## What this project demonstrates

  Building a typed React interface around a complex third party calendar system
  Managing transient UI state separately from persistent domain state
  Designing undoable, asynchronous user workflows
  Translating calendar specific date semantics across frontend, API, and database layers
  Structuring an Express/MongoDB backend for incremental product growth
  Developing a product roadmap that separates AI interpretation from deterministic decisions

   

Built as an evolving full stack product. Explore the [live application](https://calendar.ems.lol) or follow the repository as the intent first scheduling features take shape.
