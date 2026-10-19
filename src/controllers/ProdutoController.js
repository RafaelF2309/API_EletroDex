const ProdutoService = require('../services/ProdutoService');
const fs = require('fs');
const path = require('path');


class ProdutoController {
    async listar(req, res, next) {
        try {
            const resultado = await ProdutoService.listarProdutos(req.query);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async listarAbaixoDoMinimo(req, res, next) {
        try {
            const resultado = await ProdutoService.listarProdutosAbaixoDoMinimo();
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
            try {
                const resultado = await ProdutoService.criarProduto(dadosProduto);
                return res.status(201).json(resultado);
            } catch (erro) {
                // Remove uploaded file if validation fails
                if (req.file && req.file.path) {
                    fs.unlink(req.file.path, () => {});
                }
                throw erro;
            }
        } catch (erro) {
            next(erro);
        }
    }

    async atualizar(req, res, next) {
        try {
            let produtoAntigo = null;
            const dadosAtualizacao = { ...req.body };
            
            // Só sobrescreve o campo imagem se um novo arquivo for enviado
            if (req.file) {
                // Busca o produto antigo para obter o nome da imagem atual
                produtoAntigo = await ProdutoService.buscarProdutoPorId(req.params.id);
                dadosAtualizacao.imagem = req.file.filename;
            }
            
            try {
                const resultado = await ProdutoService.atualizarProduto(req.params.id, dadosAtualizacao);
                // Remove a imagem antiga se uma nova foi cadastrada
                if (req.file && produtoAntigo && produtoAntigo.dados && produtoAntigo.dados.imagem) {
                    const oldPath = path.join(__dirname, '..', '..', 'uploads', produtoAntigo.dados.imagem);
                    fs.unlink(oldPath, () => {});
                }
                return res.status(200).json(resultado);
            } catch (erro) {
                // Remove a nova imagem caso a atualização falhe
                if (req.file && req.file.path) {
                    fs.unlink(req.file.path, () => {});
                }
                throw erro;
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