import express from "express";
import { Router } from "express";
import { requireLogin } from "./login.js";
import { loggedInUsers } from "./database.js";

export const logoutRoutes = Router();

logoutRoutes.use(express.json());

logoutRoutes.delete("/", requireLogin, (req, res) => {
  loggedInUsers.pop();
  return res
    .status(200)
    .json({ message: "Usuário deslogado.", data: loggedInUsers });
});
