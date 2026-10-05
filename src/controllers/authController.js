const AuthService = require('../services/AuthService');

class AuthController {

    async login(req, res) {
        try {
            return res.status(200).json(
                await AuthService.login(req.body || {})
            );
        } catch (erro) {
            console.error('ERRO REAL NO LOGIN:', erro);

            return res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || erro.message || 'Erro interno ao realizar login',
                detalhe: process.env.NODE_ENV === 'development'
                    ? erro.stack
                    : undefined
            });
        }
    }
}

module.exports = new AuthController();