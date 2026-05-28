import express from "express";
import cookieParser from "cookie-parser";

import authMiddleware from "@/middleware/auth";

import authRoutes from "@/modules/auth/routes";
import { errorHandler } from "@/middleware/errorHandler";

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(authMiddleware);

app.use("/auth", authRoutes);

app.get("/", (_, res) => {
  res.send({
    version: "1.0.0",
    name: "Carreiros do Paraná API",
  });
});

app.use(errorHandler);
