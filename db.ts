import { promises as fs } from "fs";

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