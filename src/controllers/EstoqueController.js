const EstoqueService = require('../services/EstoqueService');

class EstoqueController {
    async listar(req, res, next) {
        try {
            const resultado = await EstoqueService.listarEstoques(req.query);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async buscarPorId(req, res, next) {
        try {
            const resultado = await EstoqueService.buscarEstoquePorId(req.params.id);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async criar(req, res, next) {
        try {
            const resultado = await EstoqueService.criarEstoque(req.body);
            return res.status(201).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async atualizar(req, res, next) {
        try {
            const resultado = await EstoqueService.atualizarEstoque(req.params.id, req.body);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async ajustar(req, res, next) {
        try {
            const resultado = await EstoqueService.ajustarEstoque(
                req.params.id,
                req.body,
                req.usuario.id_usuario
            );
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async remover(req, res, next) {
        try {
            const resultado = await EstoqueService.removerEstoque(req.params.id);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async listarAjustes(req, res, next) {
        try {
            const resultado = await EstoqueService.listarAjustes(req.query);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async listarAjustesPorEstoque(req, res, next) {
        try {
            const resultado = await EstoqueService.listarAjustesPorEstoque(req.params.id, req.query);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }
}

module.exports = new EstoqueController();