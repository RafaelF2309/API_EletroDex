const express = require('express');
const router = express.Router();
const LoteController = require('../controllers/LoteController');
const authorize = require('../middlewares/authorize')

// GET /lotes
router.get('/', LoteController.listar);

// GET /lotes/:id
router.get('/:id', LoteController.buscarPorId);

// POST /lotes
router.post('/', authorize(2), LoteController.criar);

// PATCH /lotes/:id
router.patch('/:id', authorize(2), LoteController.atualizar);

// DELETE /lotes/:id
router.delete('/:id', authorize(3), LoteController.remover);

module.exports = router;
