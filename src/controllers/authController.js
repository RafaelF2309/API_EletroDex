const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioRepository = require('../repositories/UsuarioRepository');

class AuthController {
    async login(req, res, next) {
        try {
            const { email, senha } = req.body;

            // Verificar se os campos foram enviados
            if (!email || !senha) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'E-mail e senha são obrigatórios'
                });
            }

            // Normalizar e-mail
            const emailFormatado = String(email).trim().toLowerCase();

            // Buscar usuário pelo e-mail
            const usuario = await UsuarioRepository.buscarPorEmail(emailFormatado);

            if (!usuario) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: 'E-mail ou senha inválidos'
                });
            }

            // Comparar senha informada com senha criptografada
            const senhaCorreta = await bcrypt.compare(String(senha), usuario.senha);

            if (!senhaCorreta) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: 'E-mail ou senha inválidos'
                });
            }

            const jwtSecret = process.env.JWT_SECRET || 'eletrodex_secret_key_2026_super_segura';
            const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '8h';

            // Criar payload do token
            const payload = {
                id_usuario: usuario.id_usuario,
                nome: usuario.nome,
                email: usuario.email,
                setor: usuario.setor,
                id_cargo: usuario.id_cargo
            };

            // Gerar JWT
            const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

            // Não enviar a senha para o cliente
            const usuarioSeguro = {
                id_usuario: usuario.id_usuario,
                nome: usuario.nome,
                email: usuario.email,
                setor: usuario.setor,
                id_cargo: usuario.id_cargo,
                foto_perfil: usuario.foto_perfil
            };

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Login realizado com sucesso',
                token,
                usuario: usuarioSeguro
            });

        } catch (erro) {
            console.error('Erro no login:', erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno ao realizar login'
            });
        }
    }
}

module.exports = new AuthController();
