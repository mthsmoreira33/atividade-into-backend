import express from "express";
import { Router } from "express";
import { requireLogin } from "./login.js";
import { loggedInUsers } from "./database.js";
import { memos } from "./database.js";

export const memoRoutes = Router();

memoRoutes.use(express.json());

memoRoutes.get("/", requireLogin, (req, res) => {
  return res.status(200).json({ message: "Rota de tarefas" });
});

memoRoutes.post("/:id", requireLogin, (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const user = loggedInUsers.find((user) => user.id === Number(id));

  if (!user) {
    return res.status(403).json({ message: "Usuário não está logado." });
  }

  const memo = {
    id: memos.length + 1,
    title,
    description,
    userId: loggedInUsers.id,
  };

  memos.push(memo);

  return res
    .status(201)
    .json({
      message: `Recado criado para o usuário => Nome: ${user.name} | Email: ${user.email}`,
      data: memo,
    });
});

memoRoutes.put("/:id/:memoId", requireLogin, (req, res) => {
  const { id, memoId } = req.params;
  const { title, description } = req.body;
  const user = loggedInUsers.find((user) => user.id === Number(id));

  if (!user) {
    return res.status(403).json({ message: "Usuário não está logado." });
  }

  const memoIndex = memos.findIndex((memo) => memo.id === Number(memoId));

  if (memoIndex === -1) {
    return res.status(404).json({ message: "Recado não encontrado" });
  }

  memos[memoIndex].title = title;
  memos[memoIndex].description = description;

  return res.status(201).json({ message: "Recado Atualizado.", data: memos });
});

memoRoutes.delete("/:id/:memoId", requireLogin, (req, res) => {
  const { id, memoId } = req.params;
  const user = loggedInUsers.find((user) => user.id === Number(id));
  const memoIndex = memos.findIndex((memo) => memo.id === memoId);

  if (!user) {
    return res.status(403).json({ message: "Usuário não está logado." });
  }

  const deletedMemo = memos.splice(memoIndex, 1);

  return res
    .status(200)
    .json({ message: "Recado excluído com sucesso", deletedMemo });
});
