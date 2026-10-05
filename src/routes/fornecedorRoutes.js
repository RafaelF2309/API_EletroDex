const express = require('express');
const router = express.Router();

const FornecedorController = require('../controllers/FornecedorController');

const { permitirNivel } = require('../middlewares/autorizacaoMiddleware');

// GET /api/fornecedores
router.get(
    '/',
    FornecedorController.listar
);

// GET /api/fornecedores/:id
router.get(
    '/:id',
    FornecedorController.buscarPorId
);

// POST /api/fornecedores
// Estoquista ou Gerente
router.post(
    '/',
    permitirNivel(2),
    FornecedorController.criar
);

// PATCH /api/fornecedores/:id
// Estoquista ou Gerente
router.patch(
    '/:id',
    permitirNivel(2),
    FornecedorController.atualizar
);

// DELETE /api/fornecedores/:id
// Apenas Gerente
router.delete(
    '/:id',
    permitirNivel(3),
    FornecedorController.remover
);

module.exports = router;
