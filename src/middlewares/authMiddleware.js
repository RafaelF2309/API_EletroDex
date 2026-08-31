const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next({ status: 401, mensagem: 'Token de autenticação não fornecido' });
    }

    const partes = authHeader.split(' ');

    if (partes.length !== 2) {
        return next({ status: 401, mensagem: 'Erro no formato do token. Formato esperado: Bearer <token>' });
    }

    const [scheme, token] = partes;

    if (!/^Bearer$/i.test(scheme)) {
        return next({ status: 401, mensagem: 'Token malformatado. Formato esperado: Bearer <token>' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'eletrodex_secret_key_2026_super_segura';

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return next({ status: 401, mensagem: 'Token inválido ou expirado' });
        }

        req.usuario = decoded;
        return next();
    });
}

module.exports = authMiddleware;
