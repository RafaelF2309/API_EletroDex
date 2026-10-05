const express = require('express');
const router = express.Router();
const EntradaController = require('../controllers/EntradaController');
const { permitirNivel } = require('../middlewares/autorizacaoMiddleware');

// GET /entrada
router.get('/', EntradaController.listar);

// GET /entrada/:id
router.get('/:id', EntradaController.buscarPorId);

// POST /entrada
router.post('/', permitirNivel(2), EntradaController.criar);

// PATCH /entrada/:id
router.patch('/:id', permitirNivel(2), EntradaController.atualizar);

// DELETE /entrada/:id
router.delete('/:id', permitirNivel(3), EntradaController.remover);

module.exports = router;
