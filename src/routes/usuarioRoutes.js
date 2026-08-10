const express = require('express');
const router = express.Router();
const upload = require('../config/multer')
const UsuarioController = require('../controllers/UsuarioController');

// GET /usuarios
router.get('/', UsuarioController.listar);

// GET /usuarios/:id
router.get('/:id', UsuarioController.buscarPorId);

// POST /usuarios
router.post('/', 
    upload.single('imagem'),
    UsuarioController.criar);

// PATCH /usuarios/:id
router.patch('/:id', 
    upload.single('imagem'), 
    UsuarioController.atualizar);

// DELETE /usuarios/:id
router.delete('/:id', UsuarioController.remover);

module.exports = router;
