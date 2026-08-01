/**
 * Calendar-event URL definitions.
 *
 * A router answers "which controller handles this HTTP method and path?"
 * Keep these declarations short. Validation and response handling belong in
 * the controller; calendar decisions belong in the service.
 */
import {Router} from "express";
import {
    createEvent,
    listEvents,
} from "../controllers/events.controller";

export const eventsRouter = Router();

// GET /api/events
eventsRouter.get("/", listEvents);

// POST /api/events
eventsRouter.post("/", createEvent);

// Temporary compatibility route used by the current frontend. Prefer
// POST /api/events for new code, then remove this alias after updating it.
eventsRouter.post("/save", createEvent);
