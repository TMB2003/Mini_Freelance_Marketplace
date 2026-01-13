import express from "express";
import cors from "cors";
import router from "./route.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env['CLIENT_URL'],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "Mini Freelance Marketplace API"
  });
});

app.use("/api", router);

export default app;
