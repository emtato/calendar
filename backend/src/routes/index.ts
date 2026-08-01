/**
 * Root API router.
 *
 * Use this file as a table of contents for the API. Each feature router gets a
 * prefix here. Keep route-handler logic out of this file.
 *
 * Example future features:
 *   apiRouter.use("/users", usersRouter);
 *   apiRouter.use("/calendars", calendarsRouter);
 */
import {Router} from "express";
import {eventsRouter} from "./events.routes";

export const apiRouter = Router();

apiRouter.get("/hello", (_request, response) => {
    response.send({message: "hi :>"});
});

apiRouter.use("/events", eventsRouter);
