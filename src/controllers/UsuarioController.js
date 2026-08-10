const UsuarioService = require('../services/UsuarioService');

class UsuarioController {
    async listar(req, res, next) {
        try {
            const resultado = await UsuarioService.listarUsuarios();
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async buscarPorId(req, res, next) {
        try {
            const resultado = await UsuarioService.buscarUsuarioPorId(req.params.id);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async criar(req, res, next) {
        try {
            const dadosUsuario = { 
                ...req.body, 
                imagem: req.file ? req.file.filename : null 
            };
            const resultado = await UsuarioService.criarUsuario(dadosUsuario);
            return res.status(201).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async atualizar(req, res, next) {
        try {
            const dadosAtualizacao = { ...req.body };

            // Mantém a imagem antiga caso um novo arquivo não seja enviado
            if (req.file) {
                dadosAtualizacao.imagem = req.file.filename;
            }

            const resultado = await UsuarioService.atualizarUsuario(req.params.id, dadosAtualizacao);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async remover(req, res, next) {
        try {
            const resultado = await UsuarioService.removerUsuario(req.params.id);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }
}

module.exports = new UsuarioController();