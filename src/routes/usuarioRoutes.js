const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const UsuarioController = require('../controllers/UsuarioController');
const authMiddleware = require('../middlewares/authMiddleware');

// POST /usuarios (Cadastro público)
router.post('/', upload.single('imagem'), UsuarioController.criar);

// Rotas de usuários protegidas por JWT
router.get('/', authMiddleware, UsuarioController.listar);
router.get('/:id', authMiddleware, UsuarioController.buscarPorId);
router.patch('/:id', authMiddleware, upload.single('imagem'), UsuarioController.atualizar);
router.delete('/:id', authMiddleware, UsuarioController.remover);

module.exports = router;
