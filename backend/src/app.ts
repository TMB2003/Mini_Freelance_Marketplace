import express from "express";
import cors from "cors";
import router from "./route.js";

const app = express();

// Allow all origins
app.use(
  cors({
    origin: true,          
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true       
  })
);

// Preflight for all routes
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "Mini Freelance Marketplace API" });
});

app.use("/api", router);

export default app;
