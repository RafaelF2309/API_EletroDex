const LoteService = require('../services/LoteService');

class LoteController {
    async listar(req, res) {
        try {
            const resultado = await LoteService.listarLotes();
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const resultado = await LoteService.buscarLotePorId(req.params.id);
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }

    async criar(req, res) {
        try {
            const resultado = await LoteService.criarLote(req.body);
            res.status(201).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            const resultado = await LoteService.atualizarLote(req.params.id, req.body);
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }

    async remover(req, res) {
        try {
            const resultado = await LoteService.removerLote(req.params.id);
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }
}

module.exports = new LoteController();
