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
app.use((req, res, next) => {
    const erro = new Error('Rota não encontrada');
    erro.status = 404;
    next(erro);
});

// Middleware genérico de tratamento de erros
// Recebe erros de qualquer controller via next(erro)
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const mensagem = err.mensagem || (status >= 500
        ? 'Erro interno do servidor'
        : err.message || 'Erro interno do servidor');

    // Loga apenas erros de servidor (5xx) para não poluir o console com 4xx esperados
    if (status >= 500) {
        console.error(`[ERRO ${status}] ${req.method} ${req.originalUrl}`);
        console.error(err.stack || err);
    }

    const resposta = { sucesso: false, mensagem };

    // Expõe stack trace apenas em desenvolvimento
    if (status >= 500 && process.env.NODE_ENV === 'development') {
        resposta.detalhe = err.stack;
    }

    res.status(status).json(resposta);
});

module.exports = app;
