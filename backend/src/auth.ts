import {betterAuth} from "better-auth";
import {mongodbAdapter} from "better-auth/adapters/mongodb";
import {getDatabase} from "./config/mongodb.js";

const database = await getDatabase();

export const auth = betterAuth({
    database: mongodbAdapter(database),

    emailAndPassword: {enabled: true},

    trustedOrigins: ["http://localhost:5173"],
});
