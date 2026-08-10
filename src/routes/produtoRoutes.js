const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');
const upload = require('../config/multer');

// GET /produtos
router.get('/', ProdutoController.listar);

// GET /produtos/:id
router.get('/:id', ProdutoController.buscarPorId);

// POST /produtos (campo: imagem)
router.post('/', upload.single('imagem'), ProdutoController.criar);

// PATCH /produtos/:id (campo: imagem)
router.patch('/:id', upload.single('imagem'), ProdutoController.atualizar);

// DELETE /produtos/:id
router.delete('/:id', ProdutoController.remover);

module.exports = router;
