const express = require('express');
const router = express.Router();
const EntradaController = require('../controllers/EntradaController');

// GET /entrada
router.get('/', EntradaController.listar);

// GET /entrada/:id
router.get('/:id', EntradaController.buscarPorId);

// POST /entrada
router.post('/', EntradaController.criar);

// PATCH /entrada/:id
router.patch('/:id', EntradaController.atualizar);

// DELETE /entrada/:id
router.delete('/:id', EntradaController.remover);

module.exports = router;
