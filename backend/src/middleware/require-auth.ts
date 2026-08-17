import type {NextFunction, Request, Response} from "express";
import {fromNodeHeaders} from "better-auth/node";
import {auth} from "../auth.js";

export async function requireAuth(
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> {
    const session = await auth.api.getSession({headers: fromNodeHeaders(request.headers)});

    if (!session) {
        //TODO: eventually make non logged in users cache events locally
        response.locals.userId = "DemoUserId"
    } else {
        response.locals.userId = session.user.id;
    }
    next();
}
