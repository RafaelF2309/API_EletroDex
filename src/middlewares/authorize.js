const { permitirNivel } = require('./autorizacaoMiddleware');

/**
 * Middleware para validar o nível mínimo de acesso do usuário.
 * Mantém retrocompatibilidade delegando para permitirNivel do autorizacaoMiddleware.
 */
function authorize(minimumLevel) {
    return permitirNivel(minimumLevel);
}

module.exports = authorize;
