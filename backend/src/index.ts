import express from "express";
import dotenv from "dotenv";
import router from "./route.js";
import { connectDB } from "./connectDB.js";
dotenv.config();
import cors from "cors";

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

const port = process.env['PORT'] || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
    connectDB();
});