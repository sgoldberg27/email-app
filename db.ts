import { promises as fs } from "fs";
import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";

export class CustomError extends Error {
    public message: string;
    public status: number;

    constructor(message: string, status: number) {
        super();
        this.message = message;
        this.status = status;
    }
}

const MessageSchema = z.object({
    id: z.string(),
    from: z.object({
        name: z.string(),
        avatar: z.string(),
        email: z.string(),
    }),
    to: z.array(z.object({
        name: z.string(),
        email: z.string(),
    })),
    subject: z.string(),
    message: z.string(),
    time: z.string(),
    read: z.boolean(),
    important: z.boolean(),
    hasAttachments: z.boolean(),
    labels: z.array(z.string()),
});

export type Message = z.infer<typeof MessageSchema>;


type Folder = {
    id: number;
    name: string;
    title: string;
    icon: string;
};

export async function getFolders() {
    const foldersFile = await fs.readFile("./db/folders.json", "utf-8");
    const foldersJson = JSON.parse(foldersFile);

    return foldersJson["data"] as Folder[];

}

export async function getMessages(from_name: string, to_name: string, subject: string) {
    const messagesFile = await fs.readFile("./db/important.json", "utf-8");
    const messagesJson = JSON.parse(messagesFile);

    const messages = messagesJson["data"] as Message[];

    const filteredMessages = messages.filter((message) => {
        const hasFromName = message.from.name.includes(from_name);
        const hasToName = message.to.some((to) => to.name.includes(to_name));
        const hasSubject = message.subject.includes(subject);

        return hasFromName && hasToName && hasSubject;
    });

    return filteredMessages;
}

async function sendToTrash(message: Message) {
    const trashFile = await fs.readFile("./db/trash.json", "utf-8");
    const trashJson = JSON.parse(trashFile);

    const trashMessages = trashJson["data"] as Message[];
    trashMessages.push(message);

    trashJson["data"] = trashMessages;
    await fs.writeFile("./db/trash.json", JSON.stringify(trashJson));
}

export async function deleteMessages(id: string) {
    const messagesFile = await fs.readFile("./db/important.json", "utf-8");
    const messagesJson = JSON.parse(messagesFile);

    const messages = messagesJson["data"] as Message[];

    const deletedMessage = messages.find((message) => message.id === id);
    const filteredMessages = messages.filter((message) => message.id !== id);

    messagesJson["data"] = filteredMessages;
    await fs.writeFile("./db/important.json", JSON.stringify(messagesJson));

    if (deletedMessage) {
        await sendToTrash(deletedMessage);
        return "OK";
    } else {
        throw new CustomError("No se encontro el mensaje", 404);
    }
}

export async function createMessages(newMessage: Message) {
    const importantFile = await fs.readFile("./db/important.json", "utf-8");
    const importantJson = JSON.parse(importantFile);

    const importantMessages = importantJson["data"] as Message[];
    
    const newId = uuidv4();
    newMessage["id"] = newId;

    importantMessages.push(newMessage);

    importantJson["data"] = importantMessages;
    await fs.writeFile("./db/important.json", JSON.stringify(importantJson));

    return newMessage;
}