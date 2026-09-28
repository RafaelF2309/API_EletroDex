jest.mock('../../src/controllers/FornecedorController');
jest.mock('jsonwebtoken');
jest.mock('../../src/config/auth');

const request = require('supertest');

const app = require('../../src/app');

const FornecedorController =
    require('../../src/controllers/FornecedorController');

const jwt = require('jsonwebtoken');

const { getJwtSecret } =
    require('../../src/config/auth');

describe('Integração - Rotas de Fornecedores', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        getJwtSecret.mockReturnValue(
            'chave-secreta-teste'
        );

        FornecedorController.listar.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Fornecedores listados'
                });
            }
        );

        FornecedorController.buscarPorId.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Fornecedor encontrado',
                    id: req.params.id
                });
            }
        );

        FornecedorController.criar.mockImplementation(
            (req, res) => {
                res.status(201).json({
                    sucesso: true,
                    mensagem: 'Fornecedor criado'
                });
            }
        );

        FornecedorController.atualizar.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Fornecedor atualizado'
                });
            }
        );

        FornecedorController.remover.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Fornecedor removido'
                });
            }
        );
    });

    // ==========================================
    // SEM TOKEN
    // ==========================================

    test('deve retornar 401 ao listar fornecedores sem token', async () => {

        const resposta = await request(app)
            .get('/api/fornecedores');

        expect(resposta.status)
            .toBe(401);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Token de autenticação não informado'
            });

        expect(FornecedorController.listar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // TOKEN INVÁLIDO
    // ==========================================

    test('deve retornar 401 quando o JWT for inválido', async () => {

        const erro = new Error('Token inválido');

        erro.name = 'JsonWebTokenError';

        jwt.verify.mockImplementation(() => {
            throw erro;
        });

        const resposta = await request(app)
            .get('/api/fornecedores')
            .set(
                'Authorization',
                'Bearer token-invalido'
            );

        expect(resposta.status)
            .toBe(401);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem: 'Token inválido'
            });

        expect(FornecedorController.listar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // GET COM TOKEN VÁLIDO
    // ==========================================

    test('deve permitir listar fornecedores com token válido', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .get('/api/fornecedores')
            .set(
                'Authorization',
                'Bearer token-valido'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Fornecedores listados'
            });

        expect(FornecedorController.listar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // BUSCAR POR ID
    // ==========================================

    test('deve permitir buscar fornecedor por ID com token válido', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .get('/api/fornecedores/5')
            .set(
                'Authorization',
                'Bearer token-valido'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Fornecedor encontrado',
                id: '5'
            });

        expect(FornecedorController.buscarPorId)
            .toHaveBeenCalled();
    });

    // ==========================================
    // POST - NÍVEL INSUFICIENTE
    // ==========================================

    test('deve retornar 403 ao criar fornecedor com usuário nível 1', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .post('/api/fornecedores')
            .set(
                'Authorization',
                'Bearer token-nivel-1'
            )
            .send({
                nome_fornecedor: 'Fornecedor Teste',
                email: 'teste@email.com',
                telefone: '11999999999',
                cnpj: '12345678000100'
            });

        expect(resposta.status)
            .toBe(403);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Acesso negado: operação restrita a usuários com nível de acesso 2 ou superior'
            });

        expect(FornecedorController.criar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // POST - NÍVEL 2
    // ==========================================

    test('deve permitir criar fornecedor com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .post('/api/fornecedores')
            .set(
                'Authorization',
                'Bearer token-nivel-2'
            )
            .send({
                nome_fornecedor: 'Fornecedor Teste',
                email: 'teste@email.com',
                telefone: '11999999999',
                cnpj: '12345678000100'
            });

        expect(resposta.status)
            .toBe(201);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Fornecedor criado'
            });

        expect(FornecedorController.criar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // PATCH - NÍVEL 2
    // ==========================================

    test('deve permitir atualizar fornecedor com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .patch('/api/fornecedores/5')
            .set(
                'Authorization',
                'Bearer token-nivel-2'
            )
            .send({
                telefone: '11888888888'
            });

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Fornecedor atualizado'
            });

        expect(FornecedorController.atualizar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // DELETE - NÍVEL INSUFICIENTE
    // ==========================================

    test('deve retornar 403 ao remover fornecedor com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .delete('/api/fornecedores/5')
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

        expect(FornecedorController.remover)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // DELETE - GERENTE
    // ==========================================

    test('deve permitir remover fornecedor com gerente nível 3', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 1,
            nivel_acesso: 3,
            setor: 'gerencia'
        });

        const resposta = await request(app)
            .delete('/api/fornecedores/5')
            .set(
                'Authorization',
                'Bearer token-gerente'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Fornecedor removido'
            });

        expect(FornecedorController.remover)
            .toHaveBeenCalled();
    });
});