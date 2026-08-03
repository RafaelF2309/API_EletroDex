const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');

// GET /produtos
router.get('/', ProdutoController.listar);

// GET /produtos/:id
router.get('/:id', ProdutoController.buscarPorId);

// POST /produtos
router.post('/', ProdutoController.criar);

// PATCH /produtos/:id
router.patch('/:id', ProdutoController.atualizar);

// DELETE /produtos/:id
router.delete('/:id', ProdutoController.remover);

module.exports = router;
