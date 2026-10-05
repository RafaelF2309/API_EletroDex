const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/auth')

function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Token de autenticação não informado'
            });
        }

        const partes = authHeader.split(' ');

        if (partes.length !== 2 || partes[0] !== 'Bearer') {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Formato do token inválido'
            });
        }

        const token = partes[1];
        const decoded = jwt.verify(token, getJwtSecret());

        // Guarda os dados do usuário na requisição
        req.usuario = decoded;

        next();
    } catch (erro) {
        if (erro.name === 'TokenExpiredError') {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Token expirado'
            });
        }

        if (erro.name === 'JsonWebTokenError') {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Token inválido'
            });
        }

        console.error('Erro ao validar token:', erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao validar autenticação'
        });
    }
}

module.exports = authMiddleware;
