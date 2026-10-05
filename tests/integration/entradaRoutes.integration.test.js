jest.mock('../../src/controllers/EntradaController');
jest.mock('jsonwebtoken');
jest.mock('../../src/config/auth');

const request = require('supertest');
const app = require('../../src/app');

const EntradaController =
    require('../../src/controllers/EntradaController');

const jwt = require('jsonwebtoken');

const { getJwtSecret } =
    require('../../src/config/auth');

describe('Integração - Rotas de Entrada', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        getJwtSecret.mockReturnValue(
            'chave-secreta-teste'
        );

        EntradaController.listar.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Entradas listadas'
                });
            }
        );

        EntradaController.buscarPorId.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Entrada encontrada',
                    id: req.params.id
                });
            }
        );

        EntradaController.criar.mockImplementation(
            (req, res) => {
                res.status(201).json({
                    sucesso: true,
                    mensagem: 'Entrada criada'
                });
            }
        );

        EntradaController.atualizar.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Entrada atualizada'
                });
            }
        );

        EntradaController.remover.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Entrada removida'
                });
            }
        );
    });

    // ==========================================
    // GET /entrada
    // ==========================================

    test('deve retornar 401 ao listar entradas sem token', async () => {

        const resposta = await request(app)
            .get('/api/entrada');

        expect(resposta.status)
            .toBe(401);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Token de autenticação não informado'
            });

        expect(EntradaController.listar)
            .not.toHaveBeenCalled();
    });

    test('deve permitir listar entradas com token válido', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .get('/api/entrada')
            .set(
                'Authorization',
                'Bearer token-valido'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Entradas listadas'
            });

        expect(EntradaController.listar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // GET /entrada/:id
    // ==========================================

    test('deve permitir buscar entrada por ID com token válido', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .get('/api/entrada/5')
            .set(
                'Authorization',
                'Bearer token-valido'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Entrada encontrada',
                id: '5'
            });

        expect(EntradaController.buscarPorId)
            .toHaveBeenCalled();
    });

    // ==========================================
    // POST /entrada - NÍVEL 1
    // ==========================================

    test('deve retornar 403 ao criar entrada com usuário nível 1', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .post('/api/entrada')
            .set(
                'Authorization',
                'Bearer token-nivel-1'
            )
            .send({
                id_produto: 1,
                id_lote: 1,
                quantidade: 50
            });

        expect(resposta.status)
            .toBe(403);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Acesso negado: operação restrita a usuários com nível de acesso 2 ou superior'
            });

        expect(EntradaController.criar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // POST /entrada - NÍVEL 2
    // ==========================================

    test('deve permitir criar entrada com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .post('/api/entrada')
            .set(
                'Authorization',
                'Bearer token-nivel-2'
            )
            .send({
                id_produto: 1,
                id_lote: 1,
                quantidade: 50
            });

        expect(resposta.status)
            .toBe(201);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Entrada criada'
            });

        expect(EntradaController.criar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // PATCH /entrada/:id - NÍVEL 1
    // ==========================================

    test('deve retornar 403 ao atualizar entrada com usuário nível 1', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .patch('/api/entrada/5')
            .set(
                'Authorization',
                'Bearer token-nivel-1'
            )
            .send({
                quantidade: 75
            });

        expect(resposta.status)
            .toBe(403);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Acesso negado: operação restrita a usuários com nível de acesso 2 ou superior'
            });

        expect(EntradaController.atualizar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // PATCH /entrada/:id - NÍVEL 2
    // ==========================================

    test('deve permitir atualizar entrada com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .patch('/api/entrada/5')
            .set(
                'Authorization',
                'Bearer token-nivel-2'
            )
            .send({
                quantidade: 75
            });

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Entrada atualizada'
            });

        expect(EntradaController.atualizar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // DELETE /entrada/:id - NÍVEL 2
    // ==========================================

    test('deve retornar 403 ao remover entrada com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .delete('/api/entrada/5')
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

        expect(EntradaController.remover)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // DELETE /entrada/:id - NÍVEL 3
    // ==========================================

    test('deve permitir remover entrada com gerente nível 3', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 1,
            nivel_acesso: 3,
            setor: 'gerencia'
        });

        const resposta = await request(app)
            .delete('/api/entrada/5')
            .set(
                'Authorization',
                'Bearer token-gerente'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Entrada removida'
            });

        expect(EntradaController.remover)
            .toHaveBeenCalled();
    });
});