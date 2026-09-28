<<<<<<< HEAD
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

// Rota de Autenticação (Pública: POST /api/auth/login)
router.use('/auth', authRoutes);

// Rotas de Cargos
router.use('/cargos', cargoRoutes);

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
=======
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
>>>>>>> 6336b4dfb45c281e5aea49faff9ab12de2caf7bb
