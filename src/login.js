import express from "express";
import bcrypt from "bcrypt";
import { Router } from "express";
import { users } from "./database.js";
import { loggedInUsers } from "./database.js";

export const requireLogin = (req, res, next) => {
  if (loggedInUsers.length !== 0) {
    next();
  } else {
    return res.status(401).json({ message: "Acesso não autorizado." });
  }
};

export const loginRoutes = Router();

loginRoutes.use(express.json());

loginRoutes.post("/", async (req, res) => {
  if (loggedInUsers.length >= 1) {
    return res.status(400).json({ message: "Você já está logado!" });
  }

  const { email, password } = req.body;
  const user = users.find((user) => user.email === email);

  if (!email) {
    return res.status(400).json({ message: "Email não informado." });
  }

  if (!password) {
    return res.status(400).json({ message: "Senha não informada." });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!user || !passwordMatch) {
    return res.status(404).json({ message: "Email/Senha incorretos." });
  }

  loggedInUsers.push(user);

  return res.status(201).json({ message: "Usuário logado.", data: user });
});
