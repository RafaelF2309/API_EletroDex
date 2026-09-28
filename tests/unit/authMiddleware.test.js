jest.mock('jsonwebtoken');
jest.mock('../../src/config/auth');

const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../../src/config/auth');

const authMiddleware = require('../../src/middlewares/authMiddleware');

describe('authMiddleware', () => {

    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            headers: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        next = jest.fn();

        getJwtSecret.mockReturnValue('chave-secreta-teste');
    });

    // ==========================================
    // Token ausente
    // ==========================================

    test('deve rejeitar quando o token não for informado', () => {

        authMiddleware(req, res, next);

        expect(res.status)
            .toHaveBeenCalledWith(401);

        expect(res.json)
            .toHaveBeenCalledWith({
                sucesso: false,
                mensagem:
                    'Token de autenticação não informado'
            });

        expect(next)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // Formato do token
    // ==========================================

    test('deve rejeitar quando o formato do token for inválido', () => {

        req.headers.authorization = 'Token abc123';

        authMiddleware(req, res, next);

        expect(res.status)
            .toHaveBeenCalledWith(401);

        expect(res.json)
            .toHaveBeenCalledWith({
                sucesso: false,
                mensagem: 'Formato do token inválido'
            });

        expect(jwt.verify)
            .not.toHaveBeenCalled();

        expect(next)
            .not.toHaveBeenCalled();
    });

    test('deve rejeitar quando houver mais de duas partes no token', () => {

        req.headers.authorization =
            'Bearer token extra';

        authMiddleware(req, res, next);

        expect(res.status)
            .toHaveBeenCalledWith(401);

        expect(res.json)
            .toHaveBeenCalledWith({
                sucesso: false,
                mensagem: 'Formato do token inválido'
            });

        expect(jwt.verify)
            .not.toHaveBeenCalled();

        expect(next)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // Token válido
    // ==========================================

    test('deve aceitar token válido', () => {

        const usuario = {
            id_usuario: 1,
            nome: 'João',
            nivel_acesso: 3
        };

        req.headers.authorization =
            'Bearer token-valido';

        jwt.verify.mockReturnValue(usuario);

        authMiddleware(req, res, next);

        expect(jwt.verify)
            .toHaveBeenCalledWith(
                'token-valido',
                'chave-secreta-teste'
            );

        expect(req.usuario)
            .toEqual(usuario);

        expect(next)
            .toHaveBeenCalled();

        expect(res.status)
            .not.toHaveBeenCalled();

        expect(res.json)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // Token expirado
    // ==========================================

    test('deve rejeitar token expirado', () => {

        req.headers.authorization =
            'Bearer token-expirado';

        const erro = new Error('Token expirado');
        erro.name = 'TokenExpiredError';

        jwt.verify.mockImplementation(() => {
            throw erro;
        });

        authMiddleware(req, res, next);

        expect(res.status)
            .toHaveBeenCalledWith(401);

        expect(res.json)
            .toHaveBeenCalledWith({
                sucesso: false,
                mensagem: 'Token expirado'
            });

        expect(next)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // Token inválido
    // ==========================================

    test('deve rejeitar token inválido', () => {

        req.headers.authorization =
            'Bearer token-invalido';

        const erro = new Error('Token inválido');
        erro.name = 'JsonWebTokenError';

        jwt.verify.mockImplementation(() => {
            throw erro;
        });

        authMiddleware(req, res, next);

        expect(res.status)
            .toHaveBeenCalledWith(401);

        expect(res.json)
            .toHaveBeenCalledWith({
                sucesso: false,
                mensagem: 'Token inválido'
            });

        expect(next)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // Erro inesperado
    // ==========================================

    test('deve retornar 500 quando ocorrer erro inesperado', () => {

        req.headers.authorization =
            'Bearer token';

        const erro = new Error('Erro inesperado');
        erro.name = 'DatabaseError';

        jwt.verify.mockImplementation(() => {
            throw erro;
        });

        const consoleSpy =
            jest.spyOn(console, 'error')
                .mockImplementation(() => {});

        authMiddleware(req, res, next);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({
                sucesso: false,
                mensagem:
                    'Erro ao validar autenticação'
            });

        expect(next)
            .not.toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});