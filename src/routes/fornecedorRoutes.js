const express = require('express');
const router = express.Router();
const FornecedorController = require('../controllers/FornecedorController');

// GET /fornecedores
router.get('/', FornecedorController.listar);

// GET /fornecedores/:id
router.get('/:id', FornecedorController.buscarPorId);

// POST /fornecedores
router.post('/', FornecedorController.criar);

// PATCH /fornecedores/:id
router.patch('/:id', FornecedorController.atualizar);

// DELETE /fornecedores/:id
router.delete('/:id', FornecedorController.remover);

module.exports = router;
