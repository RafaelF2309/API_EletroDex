const express = require('express');
const router = express.Router();
const FornecedorController = require('../controllers/FornecedorController');
const { permitirNivel } = require('../middlewares/autorizacaoMiddleware');

// GET /fornecedores
router.get('/', FornecedorController.listar);

// GET /fornecedores/:id
router.get('/:id', FornecedorController.buscarPorId);

// POST /fornecedores (Restrito a Estoquista ou Gerente)
router.post('/', permitirNivel(2), FornecedorController.criar);

// PATCH /fornecedores/:id (Restrito a Estoquista ou Gerente)
router.patch('/:id', permitirNivel(2), FornecedorController.atualizar);

// DELETE /fornecedores/:id (Operação sensível: restrita a Gerente)
router.delete('/:id', permitirNivel(3), FornecedorController.remover);

module.exports = router;
