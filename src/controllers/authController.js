<<<<<<< HEAD
const AuthService = require('../services/AuthService');

class AuthController {
    async login(req, res, next) {
        try {
            const { email, senha } = req.body;
            const resultado = await AuthService.login({ email, senha });
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
=======
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UsuarioRepository = require('../repositories/UsuarioRepository');

class AuthController {

    async login(req, res) {
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
            const emailFormatado = String(email)
                .trim()
                .toLowerCase();

            // Buscar usuário pelo e-mail
            const usuario = await UsuarioRepository.buscarPorEmail(
                emailFormatado
            );

            if (!usuario) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: 'E-mail ou senha inválidos'
                });
            }

            // Comparar senha informada com senha criptografada
            const senhaCorreta = await bcrypt.compare(
                senha,
                usuario.senha
            );

            if (!senhaCorreta) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: 'E-mail ou senha inválidos'
                });
            }

            // Criar payload do token
            const payload = {
                id_usuario: usuario.id_usuario,
                email: usuario.email
            };

            // Gerar JWT
            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
                }
            );

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
>>>>>>> 576f3cf141e17024050a6cdf09b3c6a0b46b1f53
        }
    }
}

<<<<<<< HEAD
module.exports = new AuthController();
=======
module.exports = new AuthController();
>>>>>>> 576f3cf141e17024050a6cdf09b3c6a0b46b1f53
