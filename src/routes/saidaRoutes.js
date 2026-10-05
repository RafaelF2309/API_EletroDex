const express = require('express');
const router = express.Router();
const SaidaController = require('../controllers/SaidaController');
const { permitirNivel } = require('../middlewares/autorizacaoMiddleware');

router.get('/', SaidaController.listar);
router.get('/:id', SaidaController.buscarPorId);
router.post('/', permitirNivel(1), SaidaController.criar);
router.patch('/:id', permitirNivel(2), SaidaController.atualizar);
router.delete('/:id', permitirNivel(3), SaidaController.remover);

module.exports = router;
