import express from "express"
import { getFolders, getMessages, deleteMessages, createMessages } from "./db";

const app = express()
const port = 3000

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});


// Get all folders
app.get("/:usuario/api/folders", async (req, res) => {
    try {
        res.send(await getFolders());
    } catch (error) {
        console.error("Error getting folders", error);
        res.status(500).send("Internal server error");
    }
});


// Get the list of messages
app.get("/:usuario/api/messages/important", async (req, res) => {
    try {
        let from = req.query.from;
        let to = req.query.to;
        let subject = req.query.subject;
    
        res.send(await getMessages(from, to, subject));
    } catch (error) {
        console.error("Error getting messages", error);
        res.status(500).send("Internal server error");
    }
});

// Delete messages
app.delete("/:usuario/api/messages/important/:id", async (req, res) => {
    try {
        let id = req.params.id;
        res.send(await deleteMessages(id));
    } catch (error) {
        console.error("Error deleting messages", error);
        res.status(500).send("Internal server error");
    }
});

app.use(express.json());

// Create messages
app.post("/:usuario/api/messages/important", async (req, res) => {
    try {
        let message = req.body;
        console.log(message);
        res.send(await createMessages(message));
    } catch (error) {
        console.error("Error getting folders", error);
        res.status(500).send("Internal server error");
    }
});