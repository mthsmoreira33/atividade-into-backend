import express from 'express';
import bcrypt from 'bcrypt';

const app = express();
const port = 8080;

const users = [];

app.use(express.json());

app.get('/', (_, res) => res.status(200).json({ message: 'Rota da Aplicação.'}));

//cadastro de usuários
app.post('/user', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
        id: users.length + 1,
        name,
        email,
        password: hashedPassword
    }

    users.push(user);

    return res.status(201).json({ message: 'Usuário criado.' });
})

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
