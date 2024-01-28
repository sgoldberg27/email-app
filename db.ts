import { promises as fs } from "fs";
import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";

// Class to create custom errors
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

// Function to read the contents of a JSON file
async function readFile(filePath: string) {
    const dataFile = await fs.readFile(filePath, "utf-8");
    return JSON.parse(dataFile);

}

// Function to write a JSON file
async function writeFile(filePath: string, data: any) {
    await fs.writeFile(filePath, JSON.stringify(data));
}

// Function to get all folders
export async function getFolders() {
    const foldersJson = await readFile("./db/folders.json");
    return foldersJson["data"] as Folder[];
}

// Function to get the list of messages that match the search criteria
export async function getMessages(from_name: string, to_name: string, subject: string) {
    const messagesJson = await readFile("./db/important.json");
    const messages = messagesJson["data"] as Message[];

    const filteredMessages = messages.filter((message) => {
        const hasFromName = message.from.name.includes(from_name);
        const hasToName = message.to.some((to) => to.name.includes(to_name));
        const hasSubject = message.subject.includes(subject);

        return hasFromName && hasToName && hasSubject;
    });

    return filteredMessages;
}

// Function to send a message to the trash folder
async function sendToTrash(message: Message) {
    const trashJson = await readFile("./db/trash.json");

    const trashMessages = trashJson["data"] as Message[];
    trashMessages.push(message);

    trashJson["data"] = trashMessages;
    await writeFile("./db/trash.json", trashJson);
}

// Function to delete a message
export async function deleteMessages(id: string) {
    const messagesJson = await readFile("./db/important.json");

    const messages = messagesJson["data"] as Message[];

    const deletedMessage = messages.find((message) => message.id === id);
    const filteredMessages = messages.filter((message) => message.id !== id);

    messagesJson["data"] = filteredMessages;
    await writeFile("./db/important.json", messagesJson);

    if (deletedMessage) {
        await sendToTrash(deletedMessage);
        return "OK";
    } else {
        throw new CustomError("No se encontro el mensaje", 404);
    }
}

// Function to create a message
export async function createMessages(newMessage: Message) {
    newMessage["id"] = uuidv4();
    const validationResult = MessageSchema.safeParse(newMessage);

    if(validationResult.success) {
        const importantJson = await readFile("./db/important.json");

        const importantMessages = importantJson["data"] as Message[];

        importantMessages.push(newMessage);

        importantJson["data"] = importantMessages;
        await writeFile("./db/important.json", importantJson);

        return newMessage;
    } else {
        throw new CustomError("Invalid message body", 400);
    }
}