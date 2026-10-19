const LoteService = require('../services/LoteService');

class LoteController {
    async listar(req, res, next) {
        try {
            const resultado = await LoteService.listarLotes(req.query);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async listarVencendo(req, res, next) {
        try {
            const resultado = await LoteService.listarLotesVencendo(req.query.dias);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async buscarPorId(req, res, next) {
        try {
            const resultado = await LoteService.buscarLotePorId(req.params.id);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async criar(req, res, next) {
        try {
            const resultado = await LoteService.criarLote(req.body);
            return res.status(201).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async atualizar(req, res, next) {
        try {
            const resultado = await LoteService.atualizarLote(req.params.id, req.body);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async remover(req, res, next) {
        try {
            const resultado = await LoteService.removerLote(req.params.id);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }
}

module.exports = new LoteController();
