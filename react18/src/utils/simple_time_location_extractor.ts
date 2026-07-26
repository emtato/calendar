//extracts location if title contains home or work
//extracts time if title contains time in the following formats
// XPM, X PM, X.XXPM, X.XX PM, X:XXPM X:XX PM, 0:XX, 13-23:XX, noon, midnight

import {CreateCalendarEventInput} from "../../../backend/src/CalendarEvent";

export const simpleTimeLocationExtractor = (title: string, timeModified: boolean,
    locationModified: boolean): [string, string, string] => {

    let returnTime = ""
    let returnLocation = ""
    let returnTitle = ""
    //TODO: eventually make returned title remove the keywords it found in title? meet Amy at 3 -> meet Amy
    if (!timeModified) {
        if ((/\bnoon\b/i).test(title) || (/\bmidnight\b/i).test(title)) {
            if ((/\bnoon\b/i).test(title) && !(/\bmidnight\b/i).test(title)) {
                returnTime = "12:00";
            } else if (!(/\bnoon\b/i).test(title) && (/\bmidnight\b/i).test(title)) {
                returnTime = "00:00";
            }
        }
        //not noon or midnight
        else {
            //find 12h time format
            let foundtime = false

            const twelveHourTime = title.match(
                /\b(@?0?[1-9]|1[0-2])(?:[.:]([0-5][0-9]))?\s*(am|pm)\b/i
            );
            if (twelveHourTime) {
                foundtime = true;
                let hour = Number(twelveHourTime[1]);
                const minute = twelveHourTime[2] ?? "00";
                const period = twelveHourTime[3].toLowerCase();

                if (period === "pm" && hour !== 12) {
                    hour += 12;
                } else if (period === "am" && hour === 12) {
                    hour = 0;
                }
                returnTime = String(hour).padStart(2, "0") + ":" + minute;
                if (hour + 1 >= 24) {
                    hour = 0;
                }

            } //try searching for 24h time format without explicit am/pm
            if (!foundtime) {
                const twentyFourHourTime = title.match(
                    /\b((1[3-9]|2[0-3]):([0-5][0-9]))\b|(?:\bat|@)\s*(1[3-9]|2[0-3])(?::([0-5][0-9]))?\b/i);
                if (twentyFourHourTime) {
                    let hour: number;
                    let minute: string;
                    if (twentyFourHourTime[2] !== undefined) {
                        // matched HH:MM
                        hour = Number(twentyFourHourTime[2]);
                        minute = twentyFourHourTime[3];
                    } else {
                        // matched an "at"/"@" time, with optional minutes
                        hour = Number(twentyFourHourTime[4]);
                        minute = twentyFourHourTime[5] ?? "00";
                    }
                    returnTime = String(hour).padStart(2, "0") + ":" + minute;

                } else {
                    const lastTimeAttempt = title.match(
                        /\b((@?0?\d|1[0-2]):([0-5][0-9])|(at|@)\s?(0?\d|1[0-2]))\b/i);
                    //TODO: prompt user with pop up to select am/pm or cancel
                    //found time, but unsure of the time (am/pm)
                }
            }

        }

    }
    if (!locationModified) {
        //TODO
    }
    return [returnTime, returnLocation, returnTitle]
}


function addOneDay(dateStr: string): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
}
