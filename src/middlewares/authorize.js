function authorize(minimumLevel) {
    return (req, res, next) => {
        const level = Number(req.usuario && req.usuario.nivel_acesso);

        if (!Number.isInteger(level) || level < minimumLevel) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Você não possui permissão para realizar esta operação'
            });
        }

        return next();
    };
}

module.exports = authorize;
