/**
 * Calendar-event URL definitions.
 *
 * A router answers "which controller handles this HTTP method and path?"
 * Keep these declarations short. Validation and response handling belong in
 * the controller; calendar decisions belong in the service.
 */
import {Router} from "express";
import {
    handleCreateEvent,
    handleListEvents,
} from "../controllers/events.controller";

export const eventsRouter = Router();

// GET /api/events
eventsRouter.get("/", handleListEvents);

// POST /api/events
eventsRouter.post("/", handleCreateEvent);
