import express from 'express';

const app = express();
const port = 8080;

app.use(express.json());

app.get('/', (_, res) => res.status(200).json({ message: 'Rota da Aplicação.'}));

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
