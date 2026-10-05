const express = require('express');
const router = express.Router();
const EstoqueController = require('../controllers/EstoqueController');
const { permitirNivel } = require('../middlewares/autorizacaoMiddleware');

// GET /estoque
router.get('/', EstoqueController.listar);

// GET /estoque/:id
router.get('/:id', EstoqueController.buscarPorId);

// POST /estoque
router.post('/', permitirNivel(2), EstoqueController.criar);

//POST /api/estoque/:id/ajuste
router.post('/:id/ajuste', permitirNivel(2), EstoqueController.ajustar);

// PATCH /estoque/:id
router.patch('/:id', permitirNivel(2), EstoqueController.atualizar);

// DELETE /estoque/:id
router.delete('/:id', permitirNivel(3), EstoqueController.remover);

module.exports = router;
