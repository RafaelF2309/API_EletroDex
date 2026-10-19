const UsuarioService = require('../services/UsuarioService');
const fs = require('fs');
const path = require('path');

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
            const resultado = await UsuarioService.buscarUsuarioPorId(req.params.id, req.usuario);
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }

    async criar(req, res, next) {
        try {
            const dadosUsuario = {
                ...req.body,
                foto_perfil: req.file ? req.file.filename : (req.body.foto_perfil || null)
            };
            try {
                const resultado = await UsuarioService.criarUsuario(dadosUsuario);
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
            let usuarioAntigo = null;
            const dadosAtualizacao = { ...req.body };

            // If a new file is uploaded, fetch old user to later remove old photo
            if (req.file) {
                usuarioAntigo = await UsuarioService.buscarUsuarioPorId(req.params.id);
                dadosAtualizacao.foto_perfil = req.file.filename;
            }

            try {
                const resultado = await UsuarioService.atualizarUsuario(
                    req.params.id,
                    dadosAtualizacao,
                    req.usuario
                );
                // Remove old photo if a new one was uploaded
                if (req.file && usuarioAntigo && usuarioAntigo.dados && usuarioAntigo.dados.foto_perfil) {
                    const oldPath = path.join(__dirname, '..', '..', 'uploads', usuarioAntigo.dados.foto_perfil);
                    fs.unlink(oldPath, () => {});
                }
                return res.status(200).json(resultado);
            } catch (erro) {
                // Remove the new uploaded file if update fails
                if (req.file && req.file.path) {
                    fs.unlink(req.file.path, () => {});
                }
                throw erro;
            }
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