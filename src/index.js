import express from 'express';
import { userRoutes } from './user.js';
import { loginRoutes } from './login.js';
import { logoutRoutes } from './logout.js';
import { memoRoutes } from './memo.js';

const app = express();
const port = 8080;

app.use(express.json());

app.get('/', (_, res) => res.status(200).json({ message: 'Rota da Aplicação.'}));

app.use('/user', userRoutes);
app.use('/login', loginRoutes);
app.use('/logout', logoutRoutes);
app.use('/memo', memoRoutes);

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
