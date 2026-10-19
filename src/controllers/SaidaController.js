const SaidaService = require('../services/SaidaService');

class SaidaController {
    async listar(req, res, next) {
        try {
            const resultado = await SaidaService.listarSaidas(req.query);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async buscarPorId(req, res, next) {
        try {
            const resultado = await SaidaService.buscarSaidaPorId(req.params.id);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async criar(req, res, next) {
        try {
            const resultado = await SaidaService.criarSaida(req.body, req.usuario?.id_usuario);
            return res.status(201).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async atualizar(req, res, next) {
        try {
            const resultado = await SaidaService.atualizarSaida(req.params.id, req.body);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async remover(req, res, next) {
        try {
            const resultado = await SaidaService.removerSaida(req.params.id);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }
}

module.exports = new SaidaController();
