const ProdutoService = require('../services/ProdutoService');

class ProdutoController {
    async listar(req, res) {
        try {
            const resultado = await ProdutoService.listarProdutos();
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const resultado = await ProdutoService.buscarProdutoPorId(req.params.id);
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }

    async criar(req, res) {
        try {
            const dadosProduto = {...req.body, imagem: req.file ? req.file.filename : null }
            const resultado = await ProdutoService.criarProduto(dadosProduto);
            res.status(201).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            const resultado = await ProdutoService.atualizarProduto(req.params.id, {...req.body, imagem: req.file ? req.file.filename : null } );
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }

    async remover(req, res) {
        try {
            const resultado = await ProdutoService.removerProduto(req.params.id);
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }
}

module.exports = new ProdutoController();
