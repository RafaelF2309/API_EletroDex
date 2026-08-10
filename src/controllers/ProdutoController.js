const ProdutoService = require('../services/ProdutoService');

class ProdutoController {
    async listar(req, res, next) {
        try {
            const resultado = await ProdutoService.listarProdutos();
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async buscarPorId(req, res, next) {
        try {
            const resultado = await ProdutoService.buscarProdutoPorId(req.params.id);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async criar(req, res, next) {
        try {
            const dadosProduto = { 
                ...req.body, 
                imagem: req.file ? req.file.filename : null 
            };
            const resultado = await ProdutoService.criarProduto(dadosProduto);
            return res.status(201).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async atualizar(req, res, next) {
        try {
            const dadosAtualizacao = { ...req.body };
            
            // Só sobrescreve o campo imagem se um novo arquivo for enviado
            if (req.file) {
                dadosAtualizacao.imagem = req.file.filename;
            }

            const resultado = await ProdutoService.atualizarProduto(req.params.id, dadosAtualizacao);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async remover(req, res, next) {
        try {
            const resultado = await ProdutoService.removerProduto(req.params.id);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }
}

module.exports = new ProdutoController();