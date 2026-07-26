import express from "express";
import {CalendarEvent} from "./CalendarEvent";
import testEvents from "./testevents.json";

const cors = require('cors');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
    res.send({message: 'hi :>'});
});

app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
});

// yipeee
/*
req.method       "GET"
req.path         "/api/hello"
req.query        URL query parameters
req.body         JSON body (for POST/PUT)
req.headers      HTTP headers
 */


app.get('/api/events', (req, res) => {
    console.log("got request")
        res.send(testEvents);
    //TODO
})

app.post('/api/events/save', (req, res) => {
    console.log("got request")
    res.send({message: 'i got it bud'});
    console.log(req.body)
})
