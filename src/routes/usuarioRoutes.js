const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const UsuarioController = require('../controllers/UsuarioController');
<<<<<<< HEAD
const authMiddleware = require('../middlewares/authMiddleware');
const { permitirNivel, autorizarCadastroUsuario } = require('../middlewares/autorizacaoMiddleware');

// POST /usuarios (Cadastro inicial ou restrito a Gerentes caso já existam usuários)
router.post('/', autorizarCadastroUsuario(), upload.single('imagem'), UsuarioController.criar);

// Rotas de usuários protegidas por JWT
router.get('/', authMiddleware, permitirNivel(2), UsuarioController.listar);
router.get('/:id', authMiddleware, UsuarioController.buscarPorId);
router.patch('/:id', authMiddleware, upload.single('imagem'), UsuarioController.atualizar);
router.delete('/:id', authMiddleware, permitirNivel(3), UsuarioController.remover);
=======
const authorize = require('../middlewares/authorize');
const validateImageContent = require('../middlewares/imageValidation');

router.post('/', authorize(3), upload.single('imagem'), validateImageContent, UsuarioController.criar);
router.get('/', UsuarioController.listar);
router.get('/:id', UsuarioController.buscarPorId);
router.patch('/:id', authorize(3), upload.single('imagem'), validateImageContent, UsuarioController.atualizar);
router.delete('/:id', authorize(3), UsuarioController.remover);
>>>>>>> 6336b4dfb45c281e5aea49faff9ab12de2caf7bb

module.exports = router;
