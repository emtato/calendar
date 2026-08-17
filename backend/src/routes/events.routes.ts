/**
 * Calendar-event URL definitions.
 *
 * A router answers "which controller handles this HTTP method and path?"
 * Keep these declarations short. Validation and response handling belong in
 * the controller; calendar decisions belong in the service.
 */
import {Router} from "express";
import {rateLimit} from "express-rate-limit";
import {
    deleteEvent,
    handleCreateEvent,
    handleListEvents,
    handleRestoreEvent,
} from "../controllers/events.controller.js";
import { requireAuth } from "../middleware/require-auth.js";

export const eventsRouter = Router();

const createEventLimiter = rateLimit({ // no spammers pls
    windowMs: 7 * 24 * 60 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Event creation limit reached. Please try again later.",
    },
});

eventsRouter.use(requireAuth); //authenticate before allowing db ops

// GET /api/events
eventsRouter.get("/", handleListEvents);

// POST /api/events
eventsRouter.post("/", createEventLimiter, handleCreateEvent);

//POST /api/events/restore
eventsRouter.post("/restore", handleRestoreEvent);

// DELETE /api/events/:id
eventsRouter.delete("/:id", deleteEvent);
