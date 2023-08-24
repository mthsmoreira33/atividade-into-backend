import express from 'express';
import bcrypt from 'bcrypt';

const app = express();
const port = 8080;

const users = [];
const memos = [];
const loggedInUsers = [];
let isLogged = false;

app.use(express.json());

app.get('/', (_, res) => res.status(200).json({ message: 'Rota da Aplicação.'}));

//cadastro de usuários
app.post('/user', async (req, res) => {
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

app.post('/login', async (req, res) => {
    if (loggedInUsers.length >= 1) {
        return res.status(400).json({ message: 'Você já está logado!' })
    }

    const { email, password } = req.body;
    const user = users.find(user => user.email === email);

    if(!email) {
        return res.status(400).json({ message: 'Email não informado.' });
    }

    if(!password) {
        return res.status(400).json({ message: 'Senha não informada.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!user || !passwordMatch) {
      return res.status(404).json({ message: 'Email/Senha incorretos.' });
    }

    loggedInUsers.push(user);
    isLogged = true;

    return res.status(201).json({ message: 'Usuário logado.', data: user })
});

const requireLogin = (req, res, next) => {
    if(isLogged) {
        next();
    } else {
        return res.status(401).json({ message: 'Acesso não autorizado.' });
    }
}

app.put("/user/:id", requireLogin, async (req, res) => {
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

  return res.status(201).json({ message: 'Usuário atualizado.', data: loggedUser});
});

app.delete('/logout', requireLogin, (req, res) => {
    loggedInUsers.pop();
    isLogged = false;
    return res.status(200).json({ message: 'Usuário deslogado.', data: loggedInUsers });
})

app.get('/memo', requireLogin, (req, res) => {
    return res.status(200).json({ message: 'Rota de tarefas' });
});

app.post('/memo/:id', requireLogin, (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const user = loggedInUsers.find(user => user.id === Number(id));

    if(!user) {
        return res.status(403).json({ message: 'Usuário não está logado.' })
    }

    const memo = {
        id: memos.length + 1,
        title,
        description,
        userId: loggedInUsers.id
    }

    memos.push(memo);

   return res.status(201).json({ message: `Recado criado para o usuário => Nome: ${user.name} | Email: ${user.email }`, data: memo});
});

app.put('/memo/:id/:memoId', requireLogin, (req, res) => {
    const { id, memoId } = req.params;
    const { title, description } = req.body;
    const user = loggedInUsers.find((user) => user.id === Number(id));

    if (!user) {
      return res.status(403).json({ message: 'Usuário não está logado.' });
    }

    const memoIndex = memos.findIndex(memo => memo.id === Number(memoId));

    if(memoIndex === -1) {
        return res.status(404).json({ message: 'Recado não encontrado' });
    }

    memos[memoIndex].title = title;
    memos[memoIndex].description = description;

    return res.status(201).json({ message: 'Recado Atualizado.', data: memos })
});

app.delete('/memo/:id/:memoId', requireLogin, (req, res) => {
    const { id, memoId } = req.params;
    const user = loggedInUsers.find((user) => user.id === Number(id));
    const memoIndex = memos.findIndex(memo => memo.id === memoId);

    if (!user) {
      return res.status(403).json({ message: "Usuário não está logado." });
    }

    const deletedMemo = memos.splice(memoIndex, 1);

    return res.status(200).json({ message: 'Recado excluído com sucesso', deletedMemo});
})

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});


