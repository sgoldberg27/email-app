import express from "express"
import { getFolders, getMessages, deleteMessages, createMessages, CustomError } from "./db";
import type { Message } from "./db";
import multer from 'multer';


const app = express()
const port = 3000


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './attatchments')
    },

    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })

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
app.get("/:usuario/api/messages/:folder", async (req, res) => {
    try {
        let from = req.query.from as string;
        let to = req.query.to as string;
        let subject = req.query.subject as string;
        
        let folder = req.params.folder as string;

        res.send(await getMessages(folder, from, to, subject));
    } catch (error) {
        console.error("Error creating message", error);
        if (error instanceof CustomError) {
            res.status(error.status).send(error.message);
        } else {
            res.status(500).send("Internal server error");
        }
    }
});

// Delete messages
app.delete("/:usuario/api/messages/:folder/:id", async (req, res) => {
    try {
        let id = req.params.id as string;
        let folder = req.params.folder as string;
        res.send(await deleteMessages(folder, id));
    } catch (error) {
        console.error("Error deleting message", error);
        if (error instanceof CustomError) {
            res.status(error.status).send(error.message);
        } else {
            res.status(500).send("Internal server error");
        }
    }
});

app.use(express.json());

// Create messages
app.post("/:usuario/api/messages/:folder", upload.array('attatchments'), async (req, res) => {
    try {
        let message = req.body as Message;
        let folder = req.params.folder as string;

        const attatchments = req.files as Express.Multer.File[];

        res.send(await createMessages(folder, message));
    } catch (error) {
        console.error("Error creating message", error);
        if (error instanceof CustomError) {
            res.status(error.status).send(error.message);
        } else {
            res.status(500).send("Internal server error");
        }

    }
});