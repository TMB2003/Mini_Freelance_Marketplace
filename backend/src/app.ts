import express from "express";
import cors from "cors";
import router from "./route.js";

const app = express();

/* ✅ CORS FIRST */
app.use(
  cors({
    origin: process.env["CLIENT_URL"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* ✅ Let cors handle preflight */
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

/* ✅ Routes AFTER CORS */
app.use("/api", router);

export default app;
