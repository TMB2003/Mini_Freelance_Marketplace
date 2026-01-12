import express from "express";
import dotenv from "dotenv";
import router from "./route.js";
import { connectDB } from "./connectDB.js";
dotenv.config();
import cors from "cors";
import http from "http";
import { initSocket } from "./socket.js";

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
    res.json({ status: 'ok', service: 'Mini Freelance Marketplace API' });
});
app.use("/api", router);

const port = process.env['PORT'] || 3000;

const server = http.createServer(app);
initSocket(server);

server.listen(port, () => {
    console.log(`Server started on port ${port}`);
    connectDB();
});