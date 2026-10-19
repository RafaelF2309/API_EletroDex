const AuthService = require('../services/AuthService');

class AuthController {

    async login(req, res, next) {
        try {
            return res.status(200).json(
                await AuthService.login(req.body || {})
            );
        } catch (erro) {
            next(erro);
        }
    }
}

module.exports = new AuthController();