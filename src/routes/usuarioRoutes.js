const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const UsuarioController = require('../controllers/UsuarioController');
const authorize = require('../middlewares/authorize');
const validateImageContent = require('../middlewares/imageValidation');

router.post('/', authorize(3), upload.single('imagem'), validateImageContent, UsuarioController.criar);
router.get('/', UsuarioController.listar);
router.get('/:id', UsuarioController.buscarPorId);
router.patch('/:id', authorize(3), upload.single('imagem'), validateImageContent, UsuarioController.atualizar);
router.delete('/:id', authorize(3), UsuarioController.remover);

module.exports = router;
