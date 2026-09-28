jest.mock('fs/promises');

const fs = require('fs/promises');

const validateImageContent =
    require('../../src/middlewares/imageValidation');

describe('validateImageContent', () => {

    let req;
    let res;
    let next;
    let handle;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            file: undefined
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        next = jest.fn();

        handle = {
            read: jest.fn(),
            close: jest.fn()
        };

        fs.open.mockResolvedValue(handle);
        fs.unlink.mockResolvedValue();
    });

    // ==========================================
    // SEM ARQUIVO
    // ==========================================

    test('deve permitir quando nenhum arquivo for enviado', async () => {

        await validateImageContent(req, res, next);

        expect(next)
            .toHaveBeenCalled();

        expect(fs.open)
            .not.toHaveBeenCalled();

        expect(res.status)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // JPEG
    // ==========================================

    test('deve permitir arquivo JPEG válido', async () => {

        req.file = {
            path: 'uploads/foto.jpg'
        };

        handle.read.mockImplementation(
            async (buffer) => {
                buffer[0] = 0xff;
                buffer[1] = 0xd8;
                buffer[2] = 0xff;
            }
        );

        await validateImageContent(req, res, next);

        expect(fs.open)
            .toHaveBeenCalledWith(
                'uploads/foto.jpg',
                'r'
            );

        expect(handle.read)
            .toHaveBeenCalled();

        expect(handle.close)
            .toHaveBeenCalled();

        expect(next)
            .toHaveBeenCalled();

        expect(res.status)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // PNG
    // ==========================================

    test('deve permitir arquivo PNG válido', async () => {

        req.file = {
            path: 'uploads/foto.png'
        };

        const assinaturaPNG = [
            0x89,
            0x50,
            0x4e,
            0x47,
            0x0d,
            0x0a,
            0x1a,
            0x0a
        ];

        handle.read.mockImplementation(
            async (buffer) => {
                assinaturaPNG.forEach(
                    (valor, indice) => {
                        buffer[indice] = valor;
                    }
                );
            }
        );

        await validateImageContent(req, res, next);

        expect(handle.close)
            .toHaveBeenCalled();

        expect(next)
            .toHaveBeenCalled();

        expect(res.status)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // GIF
    // ==========================================

    test('deve permitir arquivo GIF válido', async () => {

        req.file = {
            path: 'uploads/foto.gif'
        };

        handle.read.mockImplementation(
            async (buffer) => {
                Buffer.from('GIF89a')
                    .copy(buffer);
            }
        );

        await validateImageContent(req, res, next);

        expect(handle.close)
            .toHaveBeenCalled();

        expect(next)
            .toHaveBeenCalled();

        expect(res.status)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // WEBP
    // ==========================================

    test('deve permitir arquivo WEBP válido', async () => {

        req.file = {
            path: 'uploads/foto.webp'
        };

        handle.read.mockImplementation(
            async (buffer) => {
                Buffer.from('RIFFxxxxWEBP')
                    .copy(buffer);
            }
        );

        await validateImageContent(req, res, next);

        expect(handle.close)
            .toHaveBeenCalled();

        expect(next)
            .toHaveBeenCalled();

        expect(res.status)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // ARQUIVO INVÁLIDO
    // ==========================================

    test('deve rejeitar arquivo que não seja uma imagem válida', async () => {

        req.file = {
            path: 'uploads/arquivo.txt'
        };

        handle.read.mockImplementation(
            async (buffer) => {
                Buffer.from('ARQUIVO INVALIDO')
                    .copy(buffer);
            }
        );

        await validateImageContent(req, res, next);

        expect(handle.close)
            .toHaveBeenCalled();

        expect(fs.unlink)
            .toHaveBeenCalledWith(
                'uploads/arquivo.txt'
            );

        expect(res.status)
            .toHaveBeenCalledWith(400);

        expect(res.json)
            .toHaveBeenCalledWith({
                sucesso: false,
                mensagem:
                    'O conteúdo do arquivo não corresponde a uma imagem válida'
            });

        expect(next)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // ERRO AO LER ARQUIVO
    // ==========================================

    test('deve passar o erro para o próximo middleware quando ocorrer erro na leitura', async () => {

        req.file = {
            path: 'uploads/foto.jpg'
        };

        const erro = new Error(
            'Erro ao abrir arquivo'
        );

        fs.open.mockRejectedValue(erro);

        await validateImageContent(req, res, next);

        expect(fs.unlink)
            .toHaveBeenCalledWith(
                'uploads/foto.jpg'
            );

        expect(next)
            .toHaveBeenCalledWith(erro);

        expect(res.status)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // ERRO AO FECHAR ARQUIVO
    // ==========================================

    test('deve tratar erro ocorrido durante o processamento do arquivo', async () => {

        req.file = {
            path: 'uploads/foto.jpg'
        };

        const erro = new Error(
            'Erro ao fechar arquivo'
        );

        handle.read.mockImplementation(
            async (buffer) => {
                buffer[0] = 0xff;
                buffer[1] = 0xd8;
                buffer[2] = 0xff;
            }
        );

        handle.close.mockRejectedValue(erro);

        await validateImageContent(req, res, next);

        expect(fs.unlink)
            .toHaveBeenCalledWith(
                'uploads/foto.jpg'
            );

        expect(next)
            .toHaveBeenCalledWith(erro);
    });
});