const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

// GET /usuarios
router.get('/', UsuarioController.listar);

// GET /usuarios/:id
router.get('/:id', UsuarioController.buscarPorId);

// POST /usuarios
router.post('/', UsuarioController.criar);

// PATCH /usuarios/:id
router.patch('/:id', UsuarioController.atualizar);

// DELETE /usuarios/:id
router.delete('/:id', UsuarioController.remover);

module.exports = router;
