const express = require('express');
const path = require('path');
const routes = require('./routes');

const app = express();

app.use(express.json());

// Rota estática de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Todas as rotas ficam sob o prefixo /api
app.use('/api', routes);

// Rota raiz simples para checar se a API está no ar
app.get('/', (req, res) => {
    res.json({ sucesso: true, mensagem: 'API EletroDex rodando com sucesso' });
});

// Middleware para rota não encontrada
app.use((req, res) => {
    res.status(404).json({ sucesso: false, mensagem: 'Rota não encontrada' });
});

// Middleware genérico de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    const mensagem = err.mensagem || 'Erro interno do servidor';
    res.status(status).json({ sucesso: false, mensagem });
});

module.exports = app;
