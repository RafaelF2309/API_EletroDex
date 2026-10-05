const express = require('express');
const router = express.Router();
const LoteController = require('../controllers/LoteController');
const { permitirNivel } = require('../middlewares/autorizacaoMiddleware');

// GET /lote
router.get('/', LoteController.listar);

// GET /lote/:id
router.get('/:id', LoteController.buscarPorId);

// POST /lote
router.post('/', permitirNivel(2), LoteController.criar);

// PATCH /lote/:id
router.patch('/:id', permitirNivel(2), LoteController.atualizar);

// DELETE /lote/:id
router.delete('/:id', permitirNivel(3), LoteController.remover);

module.exports = router;
