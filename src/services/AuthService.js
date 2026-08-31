const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioRepository = require('../repositories/UsuarioRepository');

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

        const jwtSecret = process.env.JWT_SECRET || 'eletrodex_secret_key_2026_super_segura';
        const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '8h';

        const payload = {
            id_usuario: usuario.id_usuario,
            nome: usuario.nome,
            email: usuario.email,
            setor: usuario.setor,
            id_cargo: usuario.id_cargo
        };

        const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

        return {
            sucesso: true,
            mensagem: 'Login realizado com sucesso',
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nome: usuario.nome,
                email: usuario.email,
                setor: usuario.setor,
                id_cargo: usuario.id_cargo
            }
        };
    }
}

module.exports = new AuthService();
