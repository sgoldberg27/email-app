import express from "express"
import { getFolders, getMessages, deleteMessages, createMessages, CustomError } from "./db";
import type { Message } from "./db";
import { Request, Response, NextFunction } from "express";


const app = express()
const port = 3000

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

const handleErrors = (handler: (req: Request, res: Response, next: NextFunction) => Promise<any>) => async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await handler(req, res, next);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.status).send(error.message);
        } else {
            res.status(500).send("Internal server error");
        }
    }
}

interface RequestWithMessageId extends Request {
    messageId?: string;
}


// Get all folders
app.get("/:usuario/api/folders", handleErrors(async (req, res) => {
    res.send(await getFolders());
}));


// Get the list of messages
app.get("/:usuario/api/messages/:folder", handleErrors(async (req, res) => {
    const from = req.query.from as string;
    const to = req.query.to as string;
    const subject = req.query.subject as string;
    const folder = req.params.folder as string;

    res.send(await getMessages(folder, from, to, subject));
}));

// Delete messages
app.delete("/:usuario/api/messages/:folder/:id", handleErrors(async (req, res) => {
    const id = req.params.id as string;
    const folder = req.params.folder as string;

    res.send(await deleteMessages(folder, id));
}));

app.use(express.json());

// Create messages
app.post("/:usuario/api/messages/:folder", handleErrors(async (req: RequestWithMessageId, res) => {
    const message = req.body as Message;
    const folder = req.params.folder as string;

    res.send(await createMessages(folder, message));
}));