import express from 'express';
import bcrypt from 'bcrypt';
import { Router } from 'express';
import { users } from './database.js';
import { requireLogin } from './login.js';
import { loggedInUsers } from './database.js';

const userRoutes = Router();

userRoutes.use(express.json());

//cadastro de usuários
userRoutes.post('/', async (req, res) => {
    const { name, email, password } = req.body;
    const isAlreadyRegistered = users.some(user => user.email === email);

    if(isAlreadyRegistered) {
        return res.status(400).json({ message: 'Email já cadastrado!' });
    }

    if(!name) {
        return res.status(400).json({ message: 'Nome não informado' });
    }

    if(!email) {
        return res.status(400).json({ message: 'Email não informado' });
    }

    if(!password) {
        return res.status(400).json({ message: 'Senha não informada' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
        id: users.length + 1,
        name,
        email,
        password: hashedPassword
    }

    users.push(user);

    return res.status(201).json({ message: 'Usuário criado.' });
});

//atualização de usuários
userRoutes.put("/:id", requireLogin, async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Senha não informada." });
  }

  const loggedUser = loggedInUsers.find((user) => user.id === Number(id));

  const passwordMatch = await bcrypt.compare(oldPassword, loggedUser.password);

  if (!loggedUser || !passwordMatch) {
    return res.status(400).json({ message: "Email/Senha inválidos" });
  }

  const newHashedPassword = await bcrypt.hash(newPassword, 10);

  loggedUser.password = newHashedPassword;

  return res
    .status(201)
    .json({ message: "Usuário atualizado.", data: loggedUser });
});

userRoutes.delete('/:id', requireLogin, (req, res) => {
    const { id } = req.params;
    const userIndex = loggedInUsers.findIndex(user => user.id === Number(id));

    if(userIndex === -1) {
        return res.status(403).json({ message: 'Você não pode deletar outro usuário.' });
    }

    users.splice(userIndex, 1);
    loggedInUsers.pop();

    return res.status(200).json({ message: 'Usuário deletado com sucesso.' });
})

export { userRoutes };
