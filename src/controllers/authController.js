const AuthService = require('../services/AuthService');

class AuthController {
    async login(req, res, next) {
        try {
            const { email, senha } = req.body;
            const resultado = await AuthService.login({ email, senha });
            return res.status(200).json(resultado);
        } catch (erro) {
            next(erro);
        }
    }
}

module.exports = new AuthController();
