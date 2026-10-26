const express = require('express');
const path = require('path');
const routes = require('./routes');
const multer = require('./config/multer');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger');

const app = express();

app.use(express.json());

// Rota estática de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

// Todas as rotas ficam sob o prefixo /api
app.use('/api', routes);

// Rota raiz simples para checar se a API está no ar
app.get('/', (req, res) => {
    res.json({
        sucesso: true,
        mensagem: 'API EletroDex rodando com sucesso'
    });
});

// Middleware para rota não encontrada
app.use((req, res, next) => {
    const erro = new Error('Rota não encontrada');
    erro.status = 404;
    next(erro);
});

// Middleware genérico de tratamento de erros
app.use((err, req, res, next) => {

    const isMulterError = err instanceof multer.MulterError;

    const status = isMulterError
        ? 400
        : (err.status || 500);

    const mensagem = isMulterError
        ? err.message
        : (
            err.mensagem ||
            (
                status >= 500
                    ? 'Erro interno do servidor'
                    : err.message || 'Erro interno do servidor'
            )
        );

    // Loga apenas erros de servidor
    if (status >= 500) {
        console.error(
            `[ERRO ${status}] ${req.method} ${req.originalUrl}`
        );

        console.error(err.stack || err);
    }

    const resposta = {
        sucesso: false,
        mensagem
    };

    // Expõe stack trace apenas em desenvolvimento
    if (
        status >= 500 &&
        process.env.NODE_ENV === 'development'
    ) {
        resposta.detalhe = err.stack;
    }

    res.status(status).json(resposta);
});

module.exports = app;