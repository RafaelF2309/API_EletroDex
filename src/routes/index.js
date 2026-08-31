const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const authMiddleware = require('../middlewares/authMiddleware');

const usuarioRoutes = require('./usuarioRoutes');
const fornecedorRoutes = require('./fornecedorRoutes');
const produtoRoutes = require('./produtoRoutes');
const loteRoutes = require('./loteRoutes');
const estoqueRoutes = require('./estoqueRoutes');
const entradaRoutes = require('./entradaRoutes');
const saidaRoutes = require('./saidaRoutes');


// ============================================
// ROTAS PÚBLICAS
// ============================================

// Login não precisa de token
router.use('/auth', authRoutes);


// ============================================
// ROTAS PROTEGIDAS
// ============================================

// A partir daqui, todas as rotas precisam
// de um token JWT válido
router.use(authMiddleware);

router.use('/usuarios', usuarioRoutes);
router.use('/fornecedores', fornecedorRoutes);
router.use('/produtos', produtoRoutes);
router.use('/lotes', loteRoutes);
router.use('/estoque', estoqueRoutes);
router.use('/entrada', entradaRoutes);
router.use('/saida', saidaRoutes);


module.exports = router;