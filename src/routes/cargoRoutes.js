const express = require('express');
const router = express.Router();
const CargoController = require('../controllers/CargoController');
const authMiddleware = require('../middlewares/authMiddleware');
const { permitirNivel } = require('../middlewares/autorizacaoMiddleware');

// GET /cargos (Permite listar cargos para cadastro e consulta)
router.get('/', CargoController.listar);

// GET /cargos/:id
router.get('/:id', CargoController.buscarPorId);

// Rotas de alteração protegidas por autenticação JWT e restritas a Gerente (nível 3)
router.post('/', authMiddleware, permitirNivel(3), CargoController.criar);
router.patch('/:id', authMiddleware, permitirNivel(3), CargoController.atualizar);
router.delete('/:id', authMiddleware, permitirNivel(3), CargoController.remover);

module.exports = router;
