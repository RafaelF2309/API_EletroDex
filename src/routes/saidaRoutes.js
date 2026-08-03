const express = require('express');
const router = express.Router();
const SaidaController = require('../controllers/SaidaController');

// GET /saida
router.get('/', SaidaController.listar);

// GET /saida/:id
router.get('/:id', SaidaController.buscarPorId);

// POST /saida
router.post('/', SaidaController.criar);

// PATCH /saida/:id
router.patch('/:id', SaidaController.atualizar);

// DELETE /saida/:id
router.delete('/:id', SaidaController.remover);

module.exports = router;
