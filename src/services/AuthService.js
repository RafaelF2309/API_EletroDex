const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const { getJwtSecret } = require('../config/auth');

class AuthService {
    async login({ email, senha }) {
        if (!email || !senha) {
            throw { status: 400, mensagem: 'E-mail e senha são obrigatórios' };
        }

        const emailFormatado = String(email).trim().toLowerCase();
        const usuario = await UsuarioRepository.buscarPorEmail(emailFormatado);

        if (!usuario) {
            throw { status: 401, mensagem: 'E-mail ou senha inválidos' };
        }

        const senhaValida = await bcrypt.compare(String(senha), usuario.senha);
        if (!senhaValida) {
            throw { status: 401, mensagem: 'E-mail ou senha inválidos' };
        }

        const jwtSecret = getJwtSecret();
        const usuarioSeguro = {
            id_usuario: usuario.id_usuario,
            nome: usuario.nome,
            email: usuario.email,
            setor: usuario.setor,
            id_cargo: usuario.id_cargo,
            nivel_acesso: usuario.nivel_acesso,
            foto_perfil: usuario.foto_perfil
        };

        const token = jwt.sign(usuarioSeguro, jwtSecret, {
            expiresIn: process.env.JWT_EXPIRES_IN || '8h'
        });

        return {
            sucesso: true,
            mensagem: 'Login realizado com sucesso',
            token,
            usuario: usuarioSeguro
        };
    }
}

module.exports = new AuthService();