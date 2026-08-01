/**
 * Process entry point.
 *
 * Keep this file small. Its job is to start the backend process:
 * 1. read startup configuration;
 * 2. connect required infrastructure (MongoDB later);
 * 3. begin listening for HTTP requests.
 *
 * Routes and business rules do not belong here. Put Express setup in app.ts
 * and calendar behavior in services/calendar.service.ts.
 */
import {app} from "./app";
import {env} from "./config/env";

app.listen(env.port, () => {
    console.log(`Backend listening on http://localhost:${env.port}`);
});
