const express = require('express');
const router = express.Router();

const upload = require('../config/multer');
const ProdutoController = require('../controllers/ProdutoController');

const { permitirNivel } = require('../middlewares/autorizacaoMiddleware');
const validateImageContent = require('../middlewares/imageValidation');

// GET /api/produtos
router.get('/', ProdutoController.listar);

// GET /api/produtos/abaixo-do-minimo
router.get(
    '/abaixo-do-minimo',
    ProdutoController.listarAbaixoDoMinimo
);

// GET /api/produtos/:id
router.get(
    '/:id',
    ProdutoController.buscarPorId
);

// POST /api/produtos
// Estoquista ou Gerente
router.post(
    '/',
    permitirNivel(2),
    upload.single('imagem'),
    validateImageContent,
    ProdutoController.criar
);

// PATCH /api/produtos/:id
// Estoquista ou Gerente
router.patch(
    '/:id',
    permitirNivel(2),
    upload.single('imagem'),
    validateImageContent,
    ProdutoController.atualizar
);

// DELETE /api/produtos/:id
// Apenas Gerente
router.delete(
    '/:id',
    permitirNivel(3),
    ProdutoController.remover
);

module.exports = router;