const express = require('express');
const router = express.Router();
const upload = require('../config/multer')
const ProdutoController = require('../controllers/ProdutoController');
const { permitirNivel } = require('../middlewares/autorizacaoMiddleware');

// GET /produtos
router.get('/', ProdutoController.listar);

// GET /produtos/abaixo-do-minimo
router.get('/abaixo-do-minimo', ProdutoController.listarAbaixoDoMinimo);

// GET /produtos/:id
router.get('/:id', ProdutoController.buscarPorId);

// POST /produtos (Restrito a Estoquista ou Gerente)
router.post('/', 
    permitirNivel(2),
    upload.single('imagem'),
    ProdutoController.criar);

// PATCH /produtos/:id (Restrito a Estoquista ou Gerente)
router.patch('/:id', 
    permitirNivel(2),
    upload.single('imagem'), 
    ProdutoController.atualizar);

// DELETE /produtos/:id (Operação sensível: restrita a Gerente)
router.delete('/:id', permitirNivel(3), ProdutoController.remover);

module.exports = router;
