jest.mock('../../src/repositories/CargoRepository');
jest.mock('../../src/config/database');
jest.mock('jsonwebtoken');
jest.mock('../../src/config/auth');

const CargoRepository = require('../../src/repositories/CargoRepository');
const pool = require('../../src/config/database');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../../src/config/auth');

const {
    autorizar,
    permitirNivel,
    permitirSetores,
    autorizarCadastroUsuario
} = require('../../src/middlewares/autorizacaoMiddleware');

describe('autorizacaoMiddleware', () => {

    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            usuario: undefined,
            headers: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        next = jest.fn();

        getJwtSecret.mockReturnValue('chave-teste');
    });

    // ==========================================
    // AUTORIZAR
    // ==========================================

    describe('autorizar', () => {

        test('deve negar acesso quando usuário não estiver autenticado', async () => {

            const middleware = autorizar(2);

            await middleware(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(401);

            expect(res.json)
                .toHaveBeenCalledWith({
                    sucesso: false,
                    mensagem:
                        'Acesso negado: usuário não autenticado'
                });

            expect(next)
                .not.toHaveBeenCalled();
        });

        test('deve permitir acesso quando usuário possui nível suficiente', async () => {

            req.usuario = {
                nivel_acesso: 3
            };

            const middleware = autorizar(2);

            await middleware(req, res, next);

            expect(next)
                .toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        test('deve negar acesso quando nível do usuário for insuficiente', async () => {

            req.usuario = {
                nivel_acesso: 1
            };

            const middleware = autorizar(2);

            await middleware(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(403);

            expect(res.json)
                .toHaveBeenCalledWith({
                    sucesso: false,
                    mensagem:
                        'Acesso negado: operação restrita a usuários com nível de acesso 2 ou superior'
                });

            expect(next)
                .not.toHaveBeenCalled();
        });

        test('deve buscar o nível de acesso pelo cargo quando não estiver no token', async () => {

            req.usuario = {
                id_cargo: 2
            };

            CargoRepository.buscarPorId.mockResolvedValue({
                id_cargo: 2,
                nome_cargo: 'Estoquista',
                nivel_acesso: 2
            });

            const middleware = autorizar(2);

            await middleware(req, res, next);

            expect(CargoRepository.buscarPorId)
                .toHaveBeenCalledWith(2);

            expect(req.usuario.nivel_acesso)
                .toBe(2);

            expect(req.usuario.nome_cargo)
                .toBe('Estoquista');

            expect(next)
                .toHaveBeenCalled();
        });

        test('deve usar nível 1 quando o nível não estiver disponível', async () => {

            req.usuario = {};

            const middleware = autorizar(2);

            await middleware(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(403);

            expect(next)
                .not.toHaveBeenCalled();
        });

        test('deve permitir acesso ao setor autorizado', async () => {

            req.usuario = {
                nivel_acesso: 1,
                setor: 'estoque'
            };

            const middleware =
                permitirSetores('estoque');

            await middleware(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        test('deve ignorar diferença entre maiúsculas e minúsculas no setor', async () => {

            req.usuario = {
                nivel_acesso: 1,
                setor: 'ESTOQUE'
            };

            const middleware =
                permitirSetores('estoque');

            await middleware(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        test('deve negar acesso a setor não autorizado', async () => {

            req.usuario = {
                nivel_acesso: 1,
                setor: 'vendas'
            };

            const middleware =
                permitirSetores('estoque');

            await middleware(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(403);

            expect(res.json)
                .toHaveBeenCalledWith({
                    sucesso: false,
                    mensagem:
                        'Acesso negado: operação restrita ao(s) setor(es): estoque'
                });

            expect(next)
                .not.toHaveBeenCalled();
        });

        test('deve permitir gerente mesmo quando o setor não estiver na lista', async () => {

            req.usuario = {
                nivel_acesso: 3,
                setor: 'gerencia'
            };

            const middleware =
                permitirSetores('estoque');

            await middleware(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        test('deve permitir qualquer um dos setores informados', async () => {

            req.usuario = {
                nivel_acesso: 1,
                setor: 'vendas'
            };

            const middleware =
                permitirSetores('estoque', 'vendas');

            await middleware(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        test('deve retornar 500 quando ocorrer erro durante autorização', async () => {

            req.usuario = {
                id_cargo: 2
            };

            CargoRepository.buscarPorId.mockRejectedValue(
                new Error('Erro no banco')
            );

            const consoleSpy =
                jest.spyOn(console, 'error')
                    .mockImplementation(() => {});

            const middleware = autorizar(2);

            await middleware(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(500);

            expect(res.json)
                .toHaveBeenCalledWith({
                    sucesso: false,
                    mensagem:
                        'Erro interno ao validar permissões de acesso'
                });

            expect(next)
                .not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    // ==========================================
    // permitirNivel
    // ==========================================

    describe('permitirNivel', () => {

        test('deve permitir usuário com nível exatamente igual ao mínimo', async () => {

            req.usuario = {
                nivel_acesso: 2
            };

            const middleware = permitirNivel(2);

            await middleware(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        test('deve negar usuário abaixo do nível mínimo', async () => {

            req.usuario = {
                nivel_acesso: 1
            };

            const middleware = permitirNivel(2);

            await middleware(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(403);

            expect(next)
                .not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // permitirSetores
    // ==========================================

    describe('permitirSetores', () => {

        test('deve permitir setor informado', async () => {

            req.usuario = {
                nivel_acesso: 1,
                setor: 'vendas'
            };

            const middleware =
                permitirSetores('vendas');

            await middleware(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        test('deve negar quando setor não estiver permitido', async () => {

            req.usuario = {
                nivel_acesso: 1,
                setor: 'gerencia'
            };

            const middleware =
                permitirSetores('estoque');

            await middleware(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(403);

            expect(next)
                .not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // autorizarCadastroUsuario
    // ==========================================

    describe('autorizarCadastroUsuario', () => {

        test('deve permitir cadastro quando não existem usuários', async () => {

            pool.query.mockResolvedValue([
                [{ total: 0 }]
            ]);

            const middleware =
                autorizarCadastroUsuario();

            await middleware(req, res, next);

            expect(pool.query)
                .toHaveBeenCalledWith(
                    'SELECT COUNT(*) AS total FROM usuario'
                );

            expect(next)
                .toHaveBeenCalled();

            expect(res.status)
                .not.toHaveBeenCalled();
        });

        test('deve exigir autenticação quando já existem usuários', async () => {

            pool.query.mockResolvedValue([
                [{ total: 5 }]
            ]);

            const middleware =
                autorizarCadastroUsuario();

            await middleware(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(401);

            expect(res.json)
                .toHaveBeenCalledWith({
                    sucesso: false,
                    mensagem:
                        'Token de autenticação não informado. Cadastro de novos usuários restrito a Gerentes'
                });

            expect(next)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar formato de token inválido no cadastro', async () => {

            pool.query.mockResolvedValue([
                [{ total: 5 }]
            ]);

            req.headers.authorization =
                'Token abc123';

            const middleware =
                autorizarCadastroUsuario();

            await middleware(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(401);

            expect(res.json)
                .toHaveBeenCalledWith({
                    sucesso: false,
                    mensagem: 'Formato do token inválido'
                });

            expect(next)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar token expirado no cadastro', async () => {

            pool.query.mockResolvedValue([
                [{ total: 5 }]
            ]);

            req.headers.authorization =
                'Bearer token-expirado';

            const erro = new Error('Expirado');
            erro.name = 'TokenExpiredError';

            jwt.verify.mockImplementation(() => {
                throw erro;
            });

            const middleware =
                autorizarCadastroUsuario();

            await middleware(req, res, next);

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

        test('deve rejeitar token inválido no cadastro', async () => {

            pool.query.mockResolvedValue([
                [{ total: 5 }]
            ]);

            req.headers.authorization =
                'Bearer token-invalido';

            const erro = new Error('Inválido');
            erro.name = 'JsonWebTokenError';

            jwt.verify.mockImplementation(() => {
                throw erro;
            });

            const middleware =
                autorizarCadastroUsuario();

            await middleware(req, res, next);

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

        test('deve permitir gerente cadastrar usuário', async () => {

            pool.query.mockResolvedValue([
                [{ total: 5 }]
            ]);

            req.headers.authorization =
                'Bearer token-gerente';

            jwt.verify.mockReturnValue({
                id_usuario: 1,
                nivel_acesso: 3,
                setor: 'gerencia'
            });

            const middleware =
                autorizarCadastroUsuario();

            await middleware(req, res, next);

            expect(jwt.verify)
                .toHaveBeenCalledWith(
                    'token-gerente',
                    'chave-teste'
                );

            expect(req.usuario)
                .toEqual({
                    id_usuario: 1,
                    nivel_acesso: 3,
                    setor: 'gerencia'
                });

            expect(next)
                .toHaveBeenCalled();
        });

        test('deve negar cadastro para usuário abaixo do nível 3', async () => {

            pool.query.mockResolvedValue([
                [{ total: 5 }]
            ]);

            req.headers.authorization =
                'Bearer token-estoquista';

            jwt.verify.mockReturnValue({
                id_usuario: 2,
                nivel_acesso: 2,
                setor: 'estoque'
            });

            const middleware =
                autorizarCadastroUsuario();

            await middleware(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(403);

            expect(res.json)
                .toHaveBeenCalledWith({
                    sucesso: false,
                    mensagem:
                        'Acesso negado: apenas Gerentes podem cadastrar novos usuários'
                });

            expect(next)
                .not.toHaveBeenCalled();
        });

        test('deve buscar nível do cargo quando token não possuir nivel_acesso', async () => {

            pool.query.mockResolvedValue([
                [{ total: 5 }]
            ]);

            req.headers.authorization =
                'Bearer token-cargo';

            jwt.verify.mockReturnValue({
                id_usuario: 2,
                id_cargo: 3
            });

            CargoRepository.buscarPorId.mockResolvedValue({
                id_cargo: 3,
                nivel_acesso: 3,
                nome_cargo: 'Gerente'
            });

            const middleware =
                autorizarCadastroUsuario();

            await middleware(req, res, next);

            expect(CargoRepository.buscarPorId)
                .toHaveBeenCalledWith(3);

            expect(next)
                .toHaveBeenCalled();
        });

        test('deve retornar 500 quando ocorrer erro durante cadastro', async () => {

            pool.query.mockRejectedValue(
                new Error('Erro no banco')
            );

            const consoleSpy =
                jest.spyOn(console, 'error')
                    .mockImplementation(() => {});

            const middleware =
                autorizarCadastroUsuario();

            await middleware(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(500);

            expect(res.json)
                .toHaveBeenCalledWith({
                    sucesso: false,
                    mensagem:
                        'Erro interno ao validar permissão de cadastro'
                });

            expect(next)
                .not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });
});