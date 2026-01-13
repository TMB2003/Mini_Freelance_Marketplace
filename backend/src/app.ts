import express from "express";
import cors from "cors";
import router from "./route.js";

const app = express();

/* 1️⃣ CORS FIRST */
app.use(
  cors({
    origin: process.env["CLIENT_URL"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* 2️⃣ HARD STOP for preflight (NO AUTH) */
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

/* 3️⃣ Routes AFTER CORS + OPTIONS */
app.use("/api", router);

export default app;
