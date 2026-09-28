jest.mock('../../src/controllers/UsuarioController');
jest.mock('../../src/repositories/CargoRepository');
jest.mock('../../src/config/database');
jest.mock('jsonwebtoken');
jest.mock('../../src/config/auth');

const request = require('supertest');
const app = require('../../src/app');

const UsuarioController =
    require('../../src/controllers/UsuarioController');

const pool = require('../../src/config/database');
const jwt = require('jsonwebtoken');

const { getJwtSecret } =
    require('../../src/config/auth');

describe('Integração - Rotas de Usuários', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        getJwtSecret.mockReturnValue(
            'chave-secreta-teste'
        );

        UsuarioController.criar.mockImplementation(
            (req, res) => {
                res.status(201).json({
                    sucesso: true,
                    mensagem: 'Usuário criado'
                });
            }
        );

        UsuarioController.listar.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Usuários listados'
                });
            }
        );

        UsuarioController.buscarPorId.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Usuário encontrado',
                    id: req.params.id
                });
            }
        );

        UsuarioController.atualizar.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Usuário atualizado'
                });
            }
        );

        UsuarioController.remover.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Usuário removido'
                });
            }
        );
    });

    // ==========================================
    // POST /usuarios - PRIMEIRO USUÁRIO
    // ==========================================

    test('deve permitir cadastrar o primeiro usuário sem token', async () => {

        pool.query.mockResolvedValue([
            [{ total: 0 }]
        ]);

        const resposta = await request(app)
            .post('/api/usuarios')
            .send({
                nome: 'Administrador',
                email: 'admin@teste.com',
                senha: '123456',
                setor: 'gerencia',
                id_cargo: 1
            });

        expect(resposta.status)
            .toBe(201);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Usuário criado'
            });

        expect(UsuarioController.criar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // POST /usuarios - USUÁRIOS JÁ EXISTENTES
    // ==========================================

    test('deve retornar 401 ao cadastrar usuário sem token quando já existem usuários', async () => {

        pool.query.mockResolvedValue([
            [{ total: 1 }]
        ]);

        const resposta = await request(app)
            .post('/api/usuarios')
            .send({
                nome: 'Novo Usuário',
                email: 'novo@teste.com',
                senha: '123456',
                setor: 'vendas',
                id_cargo: 3
            });

        expect(resposta.status)
            .toBe(401);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Token de autenticação não informado. Cadastro de novos usuários restrito a Gerentes'
            });

        expect(UsuarioController.criar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // POST /usuarios - TOKEN NÍVEL 2
    // ==========================================

    test('deve retornar 403 ao cadastrar usuário com estoquista nível 2', async () => {

        pool.query.mockResolvedValue([
            [{ total: 1 }]
        ]);

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .post('/api/usuarios')
            .set(
                'Authorization',
                'Bearer token-nivel-2'
            )
            .send({
                nome: 'Novo Usuário',
                email: 'novo@teste.com',
                senha: '123456',
                setor: 'vendas',
                id_cargo: 3
            });

        expect(resposta.status)
            .toBe(403);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Acesso negado: apenas Gerentes podem cadastrar novos usuários'
            });

        expect(UsuarioController.criar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // POST /usuarios - TOKEN NÍVEL 3
    // ==========================================

    test('deve permitir gerente nível 3 cadastrar usuário', async () => {

        pool.query.mockResolvedValue([
            [{ total: 1 }]
        ]);

        jwt.verify.mockReturnValue({
            id_usuario: 1,
            nivel_acesso: 3,
            setor: 'gerencia'
        });

        const resposta = await request(app)
            .post('/api/usuarios')
            .set(
                'Authorization',
                'Bearer token-gerente'
            )
            .send({
                nome: 'Novo Usuário',
                email: 'novo@teste.com',
                senha: '123456',
                setor: 'vendas',
                id_cargo: 3
            });

        expect(resposta.status)
            .toBe(201);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Usuário criado'
            });

        expect(UsuarioController.criar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // GET /usuarios - SEM TOKEN
    // ==========================================

    test('deve retornar 401 ao listar usuários sem token', async () => {

        const resposta = await request(app)
            .get('/api/usuarios');

        expect(resposta.status)
            .toBe(401);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Token de autenticação não informado'
            });

        expect(UsuarioController.listar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // GET /usuarios - NÍVEL 1
    // ==========================================

    test('deve retornar 403 ao listar usuários com nível 1', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .get('/api/usuarios')
            .set(
                'Authorization',
                'Bearer token-nivel-1'
            );

        expect(resposta.status)
            .toBe(403);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Acesso negado: operação restrita a usuários com nível de acesso 2 ou superior'
            });

        expect(UsuarioController.listar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // GET /usuarios - NÍVEL 2
    // ==========================================

    test('deve permitir listar usuários com nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .get('/api/usuarios')
            .set(
                'Authorization',
                'Bearer token-nivel-2'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Usuários listados'
            });

        expect(UsuarioController.listar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // GET /usuarios/:id
    // ==========================================

    test('deve permitir buscar usuário por ID com token válido', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .get('/api/usuarios/5')
            .set(
                'Authorization',
                'Bearer token-valido'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Usuário encontrado',
                id: '5'
            });

        expect(UsuarioController.buscarPorId)
            .toHaveBeenCalled();
    });

    // ==========================================
    // PATCH /usuarios/:id - SEM TOKEN
    // ==========================================

    test('deve retornar 401 ao atualizar usuário sem token', async () => {

        const resposta = await request(app)
            .patch('/api/usuarios/5')
            .send({
                nome: 'Nome atualizado'
            });

        expect(resposta.status)
            .toBe(401);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Token de autenticação não informado'
            });

        expect(UsuarioController.atualizar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // PATCH /usuarios/:id
    // ==========================================

    test('deve permitir atualizar usuário com token válido', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .patch('/api/usuarios/5')
            .set(
                'Authorization',
                'Bearer token-valido'
            )
            .send({
                nome: 'Nome atualizado'
            });

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Usuário atualizado'
            });

        expect(UsuarioController.atualizar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // DELETE /usuarios/:id - NÍVEL 2
    // ==========================================

    test('deve retornar 403 ao remover usuário com nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .delete('/api/usuarios/5')
            .set(
                'Authorization',
                'Bearer token-nivel-2'
            );

        expect(resposta.status)
            .toBe(403);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Acesso negado: operação restrita a usuários com nível de acesso 3 ou superior'
            });

        expect(UsuarioController.remover)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // DELETE /usuarios/:id - NÍVEL 3
    // ==========================================

    test('deve permitir gerente nível 3 remover usuário', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 1,
            nivel_acesso: 3,
            setor: 'gerencia'
        });

        const resposta = await request(app)
            .delete('/api/usuarios/5')
            .set(
                'Authorization',
                'Bearer token-gerente'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Usuário removido'
            });

        expect(UsuarioController.remover)
            .toHaveBeenCalled();
    });
});