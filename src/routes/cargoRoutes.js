const express = require('express');
const router = express.Router();
const CargoController = require('../controllers/CargoController');
const authorize = require('../middlewares/authorize');

router.get('/', CargoController.listar);
router.get('/:id', CargoController.buscarPorId);
router.post('/', authorize(3), CargoController.criar);
router.patch('/:id', authorize(3), CargoController.atualizar);
router.delete('/:id', authorize(3), CargoController.remover);

module.exports = router;
