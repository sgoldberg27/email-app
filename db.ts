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
    starred: z.boolean(),
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

// Function to send a message to a specific folder
async function sendToFolder(folder: string, message: Message) {
    const folderJson = await readFile(`./db/${folder}.json`);

    const folderMessages = folderJson["data"] as Message[];
    folderMessages.push(message);

    folderJson["data"] = folderMessages;
    await writeFile(`./db/${folder}.json`, folderJson);
}

// Function to delete a message from a folder
async function deleteFromFolder(folder: string, id: string){
    const folderJson = await readFile(`./db/${folder}.json`);
    const folderMessages = folderJson["data"] as Message[];
    const filteredMessages = folderMessages.filter((message) => message.id !== id);
    folderJson["data"] = filteredMessages;
    await writeFile(`./db/${folder}.json`, folderJson);
}


// Function to get all folders
export async function getFolders() {
    const foldersJson = await readFile("./db/folders.json");
    return foldersJson["data"] as Folder[];
}

// Function to get the list of messages that match the search criteria
export async function getMessages(folder: string, from_name: string, to_name: string, subject: string) {
    const folderJson = await readFile(`./db/${folder}.json`);
    const folderMessages = folderJson["data"] as Message[];

    const filteredMessages = folderMessages.filter((message) => {
        const hasFromName = message.from.name.includes(from_name);
        const hasToName = message.to.some((to) => to.name.includes(to_name));
        const hasSubject = message.subject.includes(subject);

        return hasFromName && hasToName && hasSubject;
    });

    return filteredMessages;
}


// Function to delete a message
export async function deleteMessages(folder: string, id: string) {
    const folderJson = await readFile(`./db/${folder}.json`);

    const folderMessages = folderJson["data"] as Message[];

    const deletedMessage = folderMessages.find((message) => message.id === id);
    const filteredMessages = folderMessages.filter((message) => message.id !== id);

    if (deletedMessage) {
        folderJson["data"] = filteredMessages;
        await writeFile(`./db/${folder}.json`, folderJson);

        if (deletedMessage.important && folder !== "important") {
            await deleteFromFolder("important", deletedMessage.id);
        }

        if (deletedMessage.starred && folder !== "starred") {
            await deleteFromFolder("starred", deletedMessage.id);
        }

        await sendToFolder("trash", deletedMessage);
        return "OK";
    } else {
        throw new CustomError("No se encontro el mensaje", 404);
    }
}

// Function to create a message
export async function createMessages(folder: string, newMessage: Message) {
    newMessage["id"] = uuidv4();
    const validationResult = MessageSchema.safeParse(newMessage);

    if (validationResult.success) {
        await sendToFolder(folder, newMessage);

        if (newMessage.important && folder !== "important") {
            await sendToFolder("important", newMessage);
        }

        if (newMessage.starred && folder !== "starred") {
            await sendToFolder("starred", newMessage);
        }

        return newMessage;

    } else {
        throw new CustomError("Invalid message body", 400);
    }
}