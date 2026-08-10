const express = require('express');
const routes = require('./routes');

const app = express();
const path = require('path')

app.use(express.json());

// Todas as rotas ficam sob o prefixo /api, conforme a documentação
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
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
});

app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))

module.exports = app;
