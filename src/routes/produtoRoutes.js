const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const ProdutoController = require('../controllers/ProdutoController');
const authorize = require('../middlewares/authorize');
const validateImageContent = require('../middlewares/imageValidation');

router.get('/', ProdutoController.listar);
router.get('/:id', ProdutoController.buscarPorId);
router.post('/', authorize(2), upload.single('imagem'), validateImageContent, ProdutoController.criar);
router.patch('/:id', authorize(2), upload.single('imagem'), validateImageContent, ProdutoController.atualizar);
router.delete('/:id', authorize(3), ProdutoController.remover);

module.exports = router;
