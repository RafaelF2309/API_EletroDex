const express = require('express');
const router = express.Router();
const SaidaController = require('../controllers/SaidaController');
const authorize = require('../middlewares/authorize');

router.get('/', SaidaController.listar);
router.get('/:id', SaidaController.buscarPorId);
router.post('/', authorize(1), SaidaController.criar);
router.patch('/:id', authorize(2), SaidaController.atualizar);
router.delete('/:id', authorize(3), SaidaController.remover);

module.exports = router;
