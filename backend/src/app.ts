import express from "express";
import cors from "cors";
import router from "./route.js";

const app = express();

app.use(cors({ origin: "https://mini-freelance-marketplace-9j4e.vercel.app", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "Mini Freelance Marketplace API" });
});

app.use("/api", router);

export default app;
