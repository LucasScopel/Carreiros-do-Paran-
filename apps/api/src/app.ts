import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "@/modules/auth/routes";
import usersRoutes from "@/modules/users/routes";

import authMiddleware from "@/middleware/auth";
import { errorHandler } from "@/middleware/errorHandler";

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(authMiddleware);

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

app.get("/", (_, res) => {
  res.send({
    version: "1.0.0",
    name: "Carreiros do Paraná API",
  });
});

app.use(errorHandler);
