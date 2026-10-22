const FornecedorService = require('../services/FornecedorService');

class FornecedorController {
    async listar(req, res, next) {
        try {
            const resultado = await FornecedorService.listarFornecedores();
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async buscarPorId(req, res, next) {
        try {
            const resultado = await FornecedorService.buscarFornecedorPorId(req.params.id);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async criar(req, res, next) {
        try {
            const resultado = await FornecedorService.criarFornecedor(req.body);
            return res.status(201).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async atualizar(req, res, next) {
        try {
            const resultado = await FornecedorService.atualizarFornecedor(req.params.id, req.body);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async remover(req, res, next) {
        try {
            const resultado = await FornecedorService.removerFornecedor(req.params.id);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }
}

module.exports = new FornecedorController();
