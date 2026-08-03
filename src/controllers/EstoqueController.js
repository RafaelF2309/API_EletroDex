const EstoqueService = require('../services/EstoqueService');

class EstoqueController {
    async listar(req, res) {
        try {
            const resultado = await EstoqueService.listarEstoques();
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const resultado = await EstoqueService.buscarEstoquePorId(req.params.id);
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }

    async criar(req, res) {
        try {
            const resultado = await EstoqueService.criarEstoque(req.body);
            res.status(201).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            const resultado = await EstoqueService.atualizarEstoque(req.params.id, req.body);
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }

    async remover(req, res) {
        try {
            const resultado = await EstoqueService.removerEstoque(req.params.id);
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }
}

module.exports = new EstoqueController();
