function getJwtSecret() {
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.trim().length < 32) {
        throw new Error('JWT_SECRET deve estar definido e ter pelo menos 32 caracteres');
    }

    return secret;
}

module.exports = { getJwtSecret };