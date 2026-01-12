import express from "express";
import cors from "cors";
import router from "./route.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "Mini Freelance Marketplace API" });
});

app.use("/api", router);

export default app;
