import { promises as fs } from "fs";
import { v4 as uuidv4 } from 'uuid';

type Folder = {
    id: number;
    name: string;
    title: string;
    icon: string;
};

type Message = {
    id: string;
    from: {
        name: string;
        avatar: string;
        email: string;
    };
    to: {
        name: string;
        email: string;
    }[];
    subject: string;
    message: string;
    time: string;
    read: boolean;
    important: boolean;
    hasAttachments: boolean;
    attachments: {
        type: string;
        name: string;
        size: string;
        url: string;
    }[];
    labels: string[];
};


export async function getFolders() {
    const foldersFile = await fs.readFile("./db/folders.json", "utf-8");
    const foldersJson = JSON.parse(foldersFile);

    return foldersJson["data"] as Folder[];

}

export async function getMessages(from_name: any, to_name: any, subject: any) {
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

export async function deleteMessages(id: any) {
    const messagesFile = await fs.readFile("./db/important.json", "utf-8");
    const messagesJson = JSON.parse(messagesFile);

    const messages = messagesJson["data"] as Message[];

    const deletedMessage = messages.find((message) => message.id === id);
    const filteredMessages = messages.filter((message) => message.id !== id);

    messagesJson["data"] = filteredMessages;
    await fs.writeFile("./db/important.json", JSON.stringify(messagesJson));

    if (deletedMessage) {
        const trashFile = await fs.readFile("./db/trash.json", "utf-8");
        const trashJson = JSON.parse(trashFile);

        const trashMessages = trashJson["data"] as Message[];
        trashMessages.push(deletedMessage);

        trashJson["data"] = trashMessages;
        await fs.writeFile("./db/trash.json", JSON.stringify(trashJson));
    } else{
        return "No se encontro el mensaje"
    }

    return "OK"
}

export async function createMessages(newMessage: any) {
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