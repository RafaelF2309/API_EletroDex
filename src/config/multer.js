const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads/");
  },
  filename: (req, file, callback) => {
    const time = new Date().getTime();
    const nomeOriginal = file.originalname.replace(/\s+/g, "-");
    const nomeArquivo = `${time}-${nomeOriginal}`;
    callback(null, nomeArquivo);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const tiposPermitidos = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];
    if (tiposPermitidos.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Tipo de arquivo inválido"));
    }
  },
});

module.exports = upload;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garante que a pasta de uploads existe
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
            .replace(/\s+/g, '_')       // Substitui espaços por _
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

// Instância do multer com as configurações definidas
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limite de 5 MB por arquivo
    }
});

module.exports = upload;
