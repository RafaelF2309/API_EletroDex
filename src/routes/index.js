const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const cargoRoutes = require('./cargoRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const fornecedorRoutes = require('./fornecedorRoutes');
const produtoRoutes = require('./produtoRoutes');
const loteRoutes = require('./loteRoutes');
const estoqueRoutes = require('./estoqueRoutes');
const entradaRoutes = require('./entradaRoutes');
const saidaRoutes = require('./saidaRoutes');

const authMiddleware = require('../middlewares/authMiddleware');

// Autenticação
// POST /api/auth/login
router.use('/auth', authRoutes);

// Cargos
// As próprias rotas de cargo controlam autenticação/autorização
router.use('/cargos', cargoRoutes);

// Usuários
// O cadastro possui uma regra especial:
// primeiro usuário pode ser criado sem login.
// Depois disso, exige autenticação e nível de gerente.
router.use('/usuarios', usuarioRoutes);

// Rotas protegidas por JWT
router.use('/fornecedores', authMiddleware, fornecedorRoutes);
router.use('/produtos', authMiddleware, produtoRoutes);
router.use('/lotes', authMiddleware, loteRoutes);
router.use('/estoque', authMiddleware, estoqueRoutes);
router.use('/entrada', authMiddleware, entradaRoutes);
router.use('/saida', authMiddleware, saidaRoutes);

module.exports = router;
