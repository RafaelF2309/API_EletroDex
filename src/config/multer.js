const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garante que a pasta de uploads existe na raiz do projeto
const uploadDir = path.resolve(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do armazenamento em disco
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Formato: timestamp-nome_original.extensao
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext)
            .replace(/\s+/g, '_')            // Substitui espaços por _
            .replace(/[^a-zA-Z0-9_-]/g, ''); // Remove caracteres especiais

        cb(null, `${timestamp}-${basename}${ext}`);
    }
});

// Filtro: aceita apenas imagens
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não permitido. Envie apenas imagens (jpeg, png, webp, gif).'), false);
    }
};

// Instância do multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limite de 5 MB por arquivo
    }
});

module.exports = upload;