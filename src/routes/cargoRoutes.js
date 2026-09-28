const express = require('express');
const router = express.Router();
const CargoController = require('../controllers/CargoController');
<<<<<<< HEAD
const authMiddleware = require('../middlewares/authMiddleware');

// GET /cargos (Permite listar cargos para cadastro e consulta)
router.get('/', CargoController.listar);

// GET /cargos/:id
router.get('/:id', CargoController.buscarPorId);

// Rotas de alteração protegidas por autenticação JWT
router.post('/', authMiddleware, CargoController.criar);
router.patch('/:id', authMiddleware, CargoController.atualizar);
router.delete('/:id', authMiddleware, CargoController.remover);
=======
const authorize = require('../middlewares/authorize');

router.get('/', CargoController.listar);
router.get('/:id', CargoController.buscarPorId);
router.post('/', authorize(3), CargoController.criar);
router.patch('/:id', authorize(3), CargoController.atualizar);
router.delete('/:id', authorize(3), CargoController.remover);
>>>>>>> 6336b4dfb45c281e5aea49faff9ab12de2caf7bb

module.exports = router;
