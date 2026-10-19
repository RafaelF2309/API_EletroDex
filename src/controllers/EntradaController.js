const EntradaService = require('../services/EntradaService');

class EntradaController {
    async listar(req, res, next) {
        try {
            const resultado = await EntradaService.listarEntradas(req.query);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async buscarPorId(req, res, next) {
        try {
            const resultado = await EntradaService.buscarEntradaPorId(req.params.id);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async criar(req, res, next) {
        try {
            const resultado = await EntradaService.criarEntrada(req.body, req.usuario?.id_usuario);
            return res.status(201).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async atualizar(req, res, next) {
        try {
            const resultado = await EntradaService.atualizarEntrada(req.params.id, req.body);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async remover(req, res, next) {
        try {
            const resultado = await EntradaService.removerEntrada(req.params.id);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }
}

module.exports = new EntradaController();
