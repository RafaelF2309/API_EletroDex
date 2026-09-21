const express = require('express');
const router = express.Router();
const FornecedorController = require('../controllers/FornecedorController');
const upload = require('../config/multer');
const authorize = require('../middlewares/authorize')

// GET /fornecedores
router.get('/', FornecedorController.listar);

// GET /fornecedores/:id
router.get('/:id', FornecedorController.buscarPorId);

// POST /fornecedores (campo: logo)
router.post('/', authorize(2), FornecedorController.criar);

// PATCH /fornecedores/:id (campo: logo)
router.patch('/:id', authorize(2), FornecedorController.atualizar);

// DELETE /fornecedores/:id
router.delete('/:id', authorize(3), FornecedorController.remover);

module.exports = router;
