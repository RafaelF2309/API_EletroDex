const express = require('express');
const router = express.Router();
const EntradaController = require('../controllers/EntradaController');
const authorize = require('../middlewares/authorize')

// GET /entrada
router.get('/', EntradaController.listar);

// GET /entrada/:id
router.get('/:id', EntradaController.buscarPorId);

// POST /entrada
router.post('/', authorize(2), EntradaController.criar);

// PATCH /entrada/:id
router.patch('/:id', authorize(2), EntradaController.atualizar);

// DELETE /entrada/:id
router.delete('/:id', authorize(3), EntradaController.remover);

module.exports = router;
