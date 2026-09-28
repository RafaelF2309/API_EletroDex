const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const ProdutoController = require('../controllers/ProdutoController');
<<<<<<< HEAD
const { permitirNivel } = require('../middlewares/autorizacaoMiddleware');
=======
const authorize = require('../middlewares/authorize');
const validateImageContent = require('../middlewares/imageValidation');
>>>>>>> 6336b4dfb45c281e5aea49faff9ab12de2caf7bb

router.get('/', ProdutoController.listar);
<<<<<<< HEAD

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
=======
router.get('/:id', ProdutoController.buscarPorId);
router.post('/', authorize(2), upload.single('imagem'), validateImageContent, ProdutoController.criar);
router.patch('/:id', authorize(2), upload.single('imagem'), validateImageContent, ProdutoController.atualizar);
router.delete('/:id', authorize(3), ProdutoController.remover);
>>>>>>> 6336b4dfb45c281e5aea49faff9ab12de2caf7bb

module.exports = router;
