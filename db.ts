import { promises as fs } from "fs";

type Folder = {
    id: number;
    name: string;
    title: string;
    icon: string;
};

type Message = {
    id: number;
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
        fileName: string;
        preview: string;
        url: string;
        size: string;
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

        console.log(hasFromName, hasToName, hasSubject);

        return hasFromName && hasToName && hasSubject;
    });

    return filteredMessages;


}