const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const fornecedorRoutes = require('./fornecedorRoutes');
const produtoRoutes = require('./produtoRoutes');
const loteRoutes = require('./loteRoutes');
const estoqueRoutes = require('./estoqueRoutes');
const entradaRoutes = require('./entradaRoutes');
const saidaRoutes = require('./saidaRoutes');
const cargoRoutes = require('./cargoRoutes');
const authMiddleware = require('../middlewares/authMiddleware');

router.use('/auth', authRoutes);

router.use(authMiddleware);
router.use('/usuarios', usuarioRoutes);
router.use('/cargos', cargoRoutes);
router.use('/fornecedores', fornecedorRoutes);
router.use('/produtos', produtoRoutes);
router.use('/lotes', loteRoutes);
router.use('/estoque', estoqueRoutes);
router.use('/entrada', entradaRoutes);
router.use('/saida', saidaRoutes);

module.exports = router;
