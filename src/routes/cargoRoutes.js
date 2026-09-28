const express = require('express');
const router = express.Router();
const CargoController = require('../controllers/CargoController');
const authMiddleware = require('../middlewares/authMiddleware');

// GET /cargos (Permite listar cargos para cadastro e consulta)
router.get('/', CargoController.listar);

// GET /cargos/:id
router.get('/:id', CargoController.buscarPorId);

// Rotas de alteração protegidas por autenticação JWT
router.post('/', authMiddleware, CargoController.criar);
router.patch('/:id', authMiddleware, CargoController.atualizar);
router.delete('/:id', authMiddleware, CargoController.remover);

module.exports = router;
