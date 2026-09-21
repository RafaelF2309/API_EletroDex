const express = require('express');
const router = express.Router();
const EstoqueController = require('../controllers/EstoqueController');

// GET /estoque
router.get('/', EstoqueController.listar);

// GET /estoque/abaixo-do-minimo
router.get('/abaixo-do-minimo', EstoqueController.listarAbaixoDoMinimo);

// GET /estoque/:id
router.get('/:id', EstoqueController.buscarPorId);

// POST /estoque
router.post('/', EstoqueController.criar);

// PATCH /estoque/:id
router.patch('/:id', EstoqueController.atualizar);

// DELETE /estoque/:id
router.delete('/:id', EstoqueController.remover);

module.exports = router;
