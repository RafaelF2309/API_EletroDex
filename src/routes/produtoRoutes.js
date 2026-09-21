const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const ProdutoController = require('../controllers/ProdutoController');
const validateImageContent = require('../middlewares/imageValidation');

router.get('/', ProdutoController.listar);
router.get('/:id', ProdutoController.buscarPorId);
router.post('/', upload.single('imagem'), validateImageContent, ProdutoController.criar);
router.patch('/:id', upload.single('imagem'), validateImageContent, ProdutoController.atualizar);
router.delete('/:id', ProdutoController.remover);

module.exports = router;