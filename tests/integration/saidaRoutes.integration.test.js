jest.mock('../../src/controllers/SaidaController');
jest.mock('jsonwebtoken');
jest.mock('../../src/config/auth');

const request = require('supertest');
const app = require('../../src/app');

const SaidaController =
    require('../../src/controllers/SaidaController');

const jwt = require('jsonwebtoken');

const { getJwtSecret } =
    require('../../src/config/auth');

describe('Integração - Rotas de Saída', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        getJwtSecret.mockReturnValue(
            'chave-secreta-teste'
        );

        SaidaController.listar.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Saídas listadas'
                });
            }
        );

        SaidaController.buscarPorId.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Saída encontrada',
                    id: req.params.id
                });
            }
        );

        SaidaController.criar.mockImplementation(
            (req, res) => {
                res.status(201).json({
                    sucesso: true,
                    mensagem: 'Saída criada'
                });
            }
        );

        SaidaController.atualizar.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Saída atualizada'
                });
            }
        );

        SaidaController.remover.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Saída removida'
                });
            }
        );
    });

    // ==========================================
    // GET /saida
    // ==========================================

    test('deve retornar 401 ao listar saídas sem token', async () => {

        const resposta = await request(app)
            .get('/api/saida');

        expect(resposta.status)
            .toBe(401);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Token de autenticação não informado'
            });

        expect(SaidaController.listar)
            .not.toHaveBeenCalled();
    });

    test('deve permitir listar saídas com token válido', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .get('/api/saida')
            .set(
                'Authorization',
                'Bearer token-valido'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Saídas listadas'
            });

        expect(SaidaController.listar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // GET /saida/:id
    // ==========================================

    test('deve permitir buscar saída por ID com token válido', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .get('/api/saida/5')
            .set(
                'Authorization',
                'Bearer token-valido'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Saída encontrada',
                id: '5'
            });

        expect(SaidaController.buscarPorId)
            .toHaveBeenCalled();
    });

    // ==========================================
    // POST /saida - NÍVEL 1
    // ==========================================

    test('deve permitir criar saída com usuário nível 1', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .post('/api/saida')
            .set(
                'Authorization',
                'Bearer token-nivel-1'
            )
            .send({
                id_produto: 1,
                id_lote: 1,
                quantidade: 10
            });

        expect(resposta.status)
            .toBe(201);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Saída criada'
            });

        expect(SaidaController.criar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // POST /saida - SEM TOKEN
    // ==========================================

    test('deve retornar 401 ao criar saída sem token', async () => {

        const resposta = await request(app)
            .post('/api/saida')
            .send({
                id_produto: 1,
                id_lote: 1,
                quantidade: 10
            });

        expect(resposta.status)
            .toBe(401);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Token de autenticação não informado'
            });

        expect(SaidaController.criar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // PATCH /saida/:id - NÍVEL 1
    // ==========================================

    test('deve retornar 403 ao atualizar saída com usuário nível 1', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .patch('/api/saida/5')
            .set(
                'Authorization',
                'Bearer token-nivel-1'
            )
            .send({
                quantidade: 20
            });

        expect(resposta.status)
            .toBe(403);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Acesso negado: operação restrita a usuários com nível de acesso 2 ou superior'
            });

        expect(SaidaController.atualizar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // PATCH /saida/:id - NÍVEL 2
    // ==========================================

    test('deve permitir atualizar saída com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .patch('/api/saida/5')
            .set(
                'Authorization',
                'Bearer token-nivel-2'
            )
            .send({
                quantidade: 20
            });

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Saída atualizada'
            });

        expect(SaidaController.atualizar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // DELETE /saida/:id - NÍVEL 2
    // ==========================================

    test('deve retornar 403 ao remover saída com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .delete('/api/saida/5')
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

        expect(SaidaController.remover)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // DELETE /saida/:id - NÍVEL 3
    // ==========================================

    test('deve permitir remover saída com gerente nível 3', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 1,
            nivel_acesso: 3,
            setor: 'gerencia'
        });

        const resposta = await request(app)
            .delete('/api/saida/5')
            .set(
                'Authorization',
                'Bearer token-gerente'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Saída removida'
            });

        expect(SaidaController.remover)
            .toHaveBeenCalled();
    });
});