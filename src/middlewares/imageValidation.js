const fs = require('fs/promises');

function isValidImage(buffer) {
    const jpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const png = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const gif = buffer.length >= 6 && (buffer.subarray(0, 6).toString() === 'GIF87a' || buffer.subarray(0, 6).toString() === 'GIF89a');
    const webp = buffer.length >= 12 && buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP';
    return jpeg || png || gif || webp;
}

async function validateImageContent(req, res, next) {
    if (!req.file) return next();

    try {
        const handle = await fs.open(req.file.path, 'r');
        const buffer = Buffer.alloc(12);
        await handle.read(buffer, 0, buffer.length, 0);
        await handle.close();

        if (!isValidImage(buffer)) {
            await fs.unlink(req.file.path).catch(() => {});
            return res.status(400).json({ sucesso: false, mensagem: 'O conteúdo do arquivo não corresponde a uma imagem válida' });
        }

        return next();
    } catch (erro) {
        await fs.unlink(req.file.path).catch(() => {});
        return next(erro);
    }
}

module.exports = validateImageContent;
