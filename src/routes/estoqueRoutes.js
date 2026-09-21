const express = require('express');
const router = express.Router();
const EstoqueController = require('../controllers/EstoqueController');
const authorize = require('../middlewares/authorize')

// GET /estoque
router.get('/', EstoqueController.listar);

// GET /estoque/abaixo-do-minimo
router.get('/abaixo-do-minimo', EstoqueController.listarAbaixoDoMinimo);

// GET /estoque/:id
router.get('/:id', EstoqueController.buscarPorId);

// POST /estoque
router.post('/', authorize(2),  EstoqueController.criar);

// PATCH /estoque/:id
router.patch('/:id', authorize(2), EstoqueController.atualizar);

// DELETE /estoque/:id
router.delete('/:id', authorize(3), EstoqueController.remover);

module.exports = router;
