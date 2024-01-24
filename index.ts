import express from "express"
import { getFolders } from "./db";

const app = express()
const port = 3000

app.get("/:usuario/api/folders", async (req, res) => {
    res.send(await getFolders());
});