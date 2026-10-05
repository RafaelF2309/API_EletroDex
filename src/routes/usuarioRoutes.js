const express = require('express');
const router = express.Router();

const upload = require('../config/multer');
const UsuarioController = require('../controllers/UsuarioController');

const authMiddleware = require('../middlewares/authMiddleware');

const {
    permitirNivel,
    autorizarCadastroUsuario,
    autorizarVisualizacaoUsuario,
    autorizarEdicaoUsuario
} = require('../middlewares/autorizacaoMiddleware');

const validateImageContent = require('../middlewares/imageValidation');

// POST /api/usuarios
//
// Se não existir nenhum usuário:
//     permite cadastro inicial.
//
// Se já existir usuário:
//     exige autenticação de Gerente.
router.post(
    '/',
    autorizarCadastroUsuario(),
    upload.single('imagem'),
    validateImageContent,
    UsuarioController.criar
);

// GET /api/usuarios
// Estoquista ou Gerente
router.get(
    '/',
    authMiddleware,
    permitirNivel(2),
    UsuarioController.listar
);

// GET /api/usuarios/:id
// O próprio usuário pode ver seu perfil; outros perfis exigem nível >= 2 (Estoquista/Gerente)
router.get(
    '/:id',
    authMiddleware,
    autorizarVisualizacaoUsuario(),
    UsuarioController.buscarPorId
);

// PATCH /api/usuarios/:id
// O próprio usuário pode editar dados básicos; outros perfis exigem Gerente (nível 3)
router.patch(
    '/:id',
    authMiddleware,
    autorizarEdicaoUsuario(),
    upload.single('imagem'),
    validateImageContent,
    UsuarioController.atualizar
);

// DELETE /api/usuarios/:id
// Apenas Gerente
router.delete(
    '/:id',
    authMiddleware,
    permitirNivel(3),
    UsuarioController.remover
);

module.exports = router;