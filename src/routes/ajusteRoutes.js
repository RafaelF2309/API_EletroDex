const express = require('express');
const router = express.Router();
const EstoqueController = require('../controllers/EstoqueController');
const { permitirNivel } = require('../middlewares/autorizacaoMiddleware');

// GET /ajustes
router.get('/', permitirNivel(2), EstoqueController.listarAjustes);

module.exports = router;
