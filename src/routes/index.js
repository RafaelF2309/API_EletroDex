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
const authMiddleware = require('../middlewares/authMiddleware');

// Rota de Autenticação (Pública: POST /api/auth/login)
router.use('/auth', authRoutes);

// Rotas de Usuários (contém POST público e demais GET/PATCH/DELETE protegidos)
router.use('/usuarios', usuarioRoutes);

// Rotas protegidas por Autenticação JWT
router.use('/fornecedores', authMiddleware, fornecedorRoutes);
router.use('/produtos', authMiddleware, produtoRoutes);
router.use('/lotes', authMiddleware, loteRoutes);
router.use('/estoque', authMiddleware, estoqueRoutes);
router.use('/entrada', authMiddleware, entradaRoutes);
router.use('/saida', authMiddleware, saidaRoutes);

module.exports = router;
