import express from 'express';
import bcrypt from 'bcrypt';

const app = express();
const port = 8080;

const users = [];
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
    const { email, password } = req.body;
    const user = users.find(user => user.email === email);

    if(!email) {
        return res.status(400).json({ message: 'Email não informado.' });
    }

    if(!password) {
        return res.status(400).json({ message: 'Senha não informada.' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!user || !passwordMatch) {
      return res.status(404).json({ message: 'Email/Senha incorretos.' });
    }

    isLogged = true;

    return res.status(201).json({ message: 'Usuário logado.' })
});

const requireLogin = (req, res, next) => {
    if(isLogged) {
        next();
    } else {
        return res.status(401).json({ message: 'Acesso não autorizado.' })
    }
}

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
