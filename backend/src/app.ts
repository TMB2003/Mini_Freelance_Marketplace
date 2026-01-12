import express from "express";
import cors from "cors";
import router from "./route.js";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / Postman / curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("CORS not allowed"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// 🔴 Required for browser preflight
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "Mini Freelance Marketplace API" });
});

app.use("/api", router);

export default app;
