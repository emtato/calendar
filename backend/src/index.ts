import express from "express";
import {CalendarEvent} from "./CalendarEvent";

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
app.get('api/save', (req, res) => {
    res.send({message: 'i got it bud'});
    const newEvent: CalendarEvent = req.body;

});
