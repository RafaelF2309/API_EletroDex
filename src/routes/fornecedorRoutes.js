const express = require('express');
const router = express.Router();
const FornecedorController = require('../controllers/FornecedorController');
const upload = require('../config/multer');
const { permitirNivel } = require('../middlewares/autorizacaoMiddleware');

// GET /fornecedores
router.get('/', FornecedorController.listar);

// GET /fornecedores/:id
router.get('/:id', FornecedorController.buscarPorId);

// POST /fornecedores (campo: logo - Restrito a Estoquista ou Gerente)
router.post('/', permitirNivel(2), upload.single('logo'), FornecedorController.criar);

// PATCH /fornecedores/:id (campo: logo - Restrito a Estoquista ou Gerente)
router.patch('/:id', permitirNivel(2), upload.single('logo'), FornecedorController.atualizar);

// DELETE /fornecedores/:id (Operação sensível: restrita a Gerente)
router.delete('/:id', permitirNivel(3), FornecedorController.remover);

module.exports = router;
