    jest.mock('../../src/controllers/LoteController');
jest.mock('jsonwebtoken');
jest.mock('../../src/config/auth');

const request = require('supertest');

const app = require('../../src/app');

const LoteController =
    require('../../src/controllers/LoteController');

const jwt = require('jsonwebtoken');

const { getJwtSecret } =
    require('../../src/config/auth');

describe('Integração - Rotas de Lotes', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        getJwtSecret.mockReturnValue(
            'chave-secreta-teste'
        );

        LoteController.listar.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Lotes listados'
                });
            }
        );

        LoteController.buscarPorId.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Lote encontrado',
                    id: req.params.id
                });
            }
        );

        LoteController.criar.mockImplementation(
            (req, res) => {
                res.status(201).json({
                    sucesso: true,
                    mensagem: 'Lote criado'
                });
            }
        );

        LoteController.atualizar.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Lote atualizado'
                });
            }
        );

        LoteController.remover.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Lote removido'
                });
            }
        );
    });

    // ==========================================
    // SEM TOKEN
    // ==========================================

    test('deve retornar 401 ao listar lotes sem token', async () => {

        const resposta = await request(app)
            .get('/api/lotes');

        expect(resposta.status)
            .toBe(401);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Token de autenticação não informado'
            });

        expect(LoteController.listar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // GET COM TOKEN NÍVEL 1
    // ==========================================

    test('deve permitir listar lotes para usuário nível 1', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .get('/api/lotes')
            .set(
                'Authorization',
                'Bearer token-nivel-1'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Lotes listados'
            });

        expect(LoteController.listar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // BUSCAR POR ID
    // ==========================================

    test('deve permitir buscar lote por ID com token válido', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .get('/api/lotes/5')
            .set(
                'Authorization',
                'Bearer token-valido'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Lote encontrado',
                id: '5'
            });

        expect(LoteController.buscarPorId)
            .toHaveBeenCalled();
    });

    // ==========================================
    // POST - NÍVEL INSUFICIENTE
    // ==========================================

    test('deve retornar 403 ao criar lote com usuário nível 1', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .post('/api/lotes')
            .set(
                'Authorization',
                'Bearer token-nivel-1'
            )
            .send({
                id_produto: 1,
                numero_lote: 'LOTE-001',
                dt_fabricacao: '2026-09-01',
                dt_validade: '2027-09-01',
                quantidade_inicial: 100,
                id_fornecedor: 1
            });

        expect(resposta.status)
            .toBe(403);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Acesso negado: operação restrita a usuários com nível de acesso 2 ou superior'
            });

        expect(LoteController.criar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // POST - NÍVEL 2
    // ==========================================

    test('deve permitir criar lote com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .post('/api/lotes')
            .set(
                'Authorization',
                'Bearer token-nivel-2'
            )
            .send({
                id_produto: 1,
                numero_lote: 'LOTE-001',
                dt_fabricacao: '2026-09-01',
                dt_validade: '2027-09-01',
                quantidade_inicial: 100,
                id_fornecedor: 1
            });

        expect(resposta.status)
            .toBe(201);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Lote criado'
            });

        expect(LoteController.criar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // PATCH - NÍVEL 2
    // ==========================================

    test('deve permitir atualizar lote com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .patch('/api/lotes/5')
            .set(
                'Authorization',
                'Bearer token-nivel-2'
            )
            .send({
                numero_lote: 'LOTE-ATUALIZADO'
            });

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Lote atualizado'
            });

        expect(LoteController.atualizar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // DELETE - NÍVEL INSUFICIENTE
    // ==========================================

    test('deve retornar 403 ao remover lote com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .delete('/api/lotes/5')
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

        expect(LoteController.remover)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // DELETE - NÍVEL 3
    // ==========================================

    test('deve permitir remover lote com gerente nível 3', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 1,
            nivel_acesso: 3,
            setor: 'gerencia'
        });

        const resposta = await request(app)
            .delete('/api/lotes/5')
            .set(
                'Authorization',
                'Bearer token-gerente'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Lote removido'
            });

        expect(LoteController.remover)
            .toHaveBeenCalled();
    });
});