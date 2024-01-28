import express from "express"
import { getFolders, getMessages, deleteMessages, createMessages } from "./db";
import type { Message } from "./db"; 

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
        let from = req.query.from as string;
        let to = req.query.to as string;
        let subject = req.query.subject as string;
    
        res.send(await getMessages(from, to, subject));
    } catch (error) {
        console.error("Error getting messages", error);
        res.status(500).send("Internal server error");
    }
});

// Delete messages
app.delete("/:usuario/api/messages/important/:id", async (req, res) => {
    let id = req.params.id as string;

    let response = await deleteMessages(id);

    if (response.length == 0) {
        res.status(404).send("No se encontro el mensaje");
    } else {
    
        res.send(response);
    }
});

app.use(express.json());

// Create messages
app.post("/:usuario/api/messages/important", async (req, res) => {
    try {
        let message = req.body as Message;
        res.send(await createMessages(message));
    } catch (error) {
        console.error("Error creating message", error);
        res.status(400).send("Bad request");
    }
});