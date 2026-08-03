const express = require('express');
const router = express.Router();
const LoteController = require('../controllers/LoteController');

// GET /lotes
router.get('/', LoteController.listar);

// GET /lotes/:id
router.get('/:id', LoteController.buscarPorId);

// POST /lotes
router.post('/', LoteController.criar);

// PATCH /lotes/:id
router.patch('/:id', LoteController.atualizar);

// DELETE /lotes/:id
router.delete('/:id', LoteController.remover);

module.exports = router;
