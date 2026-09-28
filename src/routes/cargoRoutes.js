const express = require('express');

const router = express.Router();

const CargoController = require('../controllers/CargoController');

const authMiddleware = require('../middlewares/authMiddleware');

const {
    permitirNivel
} = require('../middlewares/autorizacaoMiddleware');

// GET /api/cargos
// Consulta pública para facilitar seleção de cargos.
router.get(
    '/',
    CargoController.listar
);

// GET /api/cargos/:id
router.get(
    '/:id',
    CargoController.buscarPorId
);

// POST /api/cargos
// Apenas Gerente
router.post(
    '/',
    authMiddleware,
    permitirNivel(3),
    CargoController.criar
);

// PATCH /api/cargos/:id
// Apenas Gerente
router.patch(
    '/:id',
    authMiddleware,
    permitirNivel(3),
    CargoController.atualizar
);

// DELETE /api/cargos/:id
// Apenas Gerente
router.delete(
    '/:id',
    authMiddleware,
    permitirNivel(3),
    CargoController.remover
);

module.exports = router;