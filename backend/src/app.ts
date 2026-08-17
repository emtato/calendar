/**
 * Express application assembly.
 *
 * This is the central file for HTTP-level setup: middleware, top-level routers,
 * and eventually a shared error handler. It wires pieces together but should
 * not contain calendar, Gemini, or MongoDB business logic.
 *
 * Exporting `app` without calling `listen()` also makes it easier to test later.
 */
import express from "express";
import cors from "cors";
import {apiRouter} from "./routes/index.js";

import {toNodeHandler} from "better-auth/node";
import {auth} from "./auth.js";

export const app = express();
app.set("trust proxy", 1);


app.use(cors({
    origin: ["http://localhost:5173", "https://tempo.ems.lol"], credentials: true
}));
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use("/api", apiRouter);
