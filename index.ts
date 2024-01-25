import express from "express"
import { getFolders, getMessages } from "./db";

const app = express()
const port = 3000

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

// Get all folders
app.get("/:usuario/api/folders", async (req, res) => {
    res.send(await getFolders());
});


// Get the list of messages
app.get("/:usuario/api/messages/important", async (req, res) => {

    let from = req.query.from;
    let to = req.query.to;
    let subject = req.query.subject;

    res.send(await getMessages(from, to, subject));
});