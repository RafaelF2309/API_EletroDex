const express = require('express');
const router = express.Router();
const FornecedorController = require('../controllers/FornecedorController');
const upload = require('../config/multer');
<<<<<<< HEAD
const { permitirNivel } = require('../middlewares/autorizacaoMiddleware');
=======
const authorize = require('../middlewares/authorize')
>>>>>>> 6336b4dfb45c281e5aea49faff9ab12de2caf7bb

// GET /fornecedores
router.get('/', FornecedorController.listar);

// GET /fornecedores/:id
router.get('/:id', FornecedorController.buscarPorId);

<<<<<<< HEAD
// POST /fornecedores (campo: logo - Restrito a Estoquista ou Gerente)
router.post('/', permitirNivel(2), upload.single('logo'), FornecedorController.criar);

// PATCH /fornecedores/:id (campo: logo - Restrito a Estoquista ou Gerente)
router.patch('/:id', permitirNivel(2), upload.single('logo'), FornecedorController.atualizar);

// DELETE /fornecedores/:id (Operação sensível: restrita a Gerente)
router.delete('/:id', permitirNivel(3), FornecedorController.remover);
=======
// POST /fornecedores (campo: logo)
router.post('/', authorize(2), FornecedorController.criar);

// PATCH /fornecedores/:id (campo: logo)
router.patch('/:id', authorize(2), FornecedorController.atualizar);

// DELETE /fornecedores/:id
router.delete('/:id', authorize(3), FornecedorController.remover);
>>>>>>> 6336b4dfb45c281e5aea49faff9ab12de2caf7bb

module.exports = router;
