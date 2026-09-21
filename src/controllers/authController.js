const AuthService = require('../services/AuthService');

class AuthController {
    async login(req, res) {
        try {
            const resultado = await AuthService.login(req.body);
            return res.status(200).json(resultado);
        } catch (erro) {
            return res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || 'Erro interno ao realizar login'
            });
        }
    }
}

module.exports = new AuthController();
