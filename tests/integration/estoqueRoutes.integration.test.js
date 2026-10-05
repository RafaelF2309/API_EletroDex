jest.mock('../../src/controllers/EstoqueController');
jest.mock('jsonwebtoken');
jest.mock('../../src/config/auth');

const request = require('supertest');
const app = require('../../src/app');

const EstoqueController =
    require('../../src/controllers/EstoqueController');

const jwt = require('jsonwebtoken');

const { getJwtSecret } =
    require('../../src/config/auth');

describe('Integração - Rotas de Estoque', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        getJwtSecret.mockReturnValue(
            'chave-secreta-teste'
        );

        EstoqueController.listar.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Estoques listados'
                });
            }
        );

        EstoqueController.buscarPorId.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Estoque encontrado',
                    id: req.params.id
                });
            }
        );

        EstoqueController.criar.mockImplementation(
            (req, res) => {
                res.status(201).json({
                    sucesso: true,
                    mensagem: 'Estoque criado'
                });
            }
        );

        EstoqueController.ajustar.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Estoque ajustado',
                    id: req.params.id
                });
            }
        );

        EstoqueController.atualizar.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Estoque atualizado'
                });
            }
        );

        EstoqueController.remover.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Estoque removido'
                });
            }
        );
    });

    // ==========================================
    // GET /estoque
    // ==========================================

    test('deve retornar 401 ao listar estoque sem token', async () => {

        const resposta = await request(app)
            .get('/api/estoque');

        expect(resposta.status)
            .toBe(401);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Token de autenticação não informado'
            });

        expect(EstoqueController.listar)
            .not.toHaveBeenCalled();
    });

    test('deve permitir listar estoque com token válido', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .get('/api/estoque')
            .set(
                'Authorization',
                'Bearer token-valido'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Estoques listados'
            });

        expect(EstoqueController.listar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // GET /estoque/:id
    // ==========================================

    test('deve permitir buscar estoque por ID com token válido', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .get('/api/estoque/5')
            .set(
                'Authorization',
                'Bearer token-valido'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Estoque encontrado',
                id: '5'
            });

        expect(EstoqueController.buscarPorId)
            .toHaveBeenCalled();
    });

    // ==========================================
    // POST /estoque - NÍVEL 1
    // ==========================================

    test('deve retornar 403 ao criar estoque com usuário nível 1', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .post('/api/estoque')
            .set(
                'Authorization',
                'Bearer token-nivel-1'
            )
            .send({
                id_produto: 1,
                id_lote: 1,
                qtd_atual: 100,
                localizacao: 'A-01'
            });

        expect(resposta.status)
            .toBe(403);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Acesso negado: operação restrita a usuários com nível de acesso 2 ou superior'
            });

        expect(EstoqueController.criar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // POST /estoque - NÍVEL 2
    // ==========================================

    test('deve permitir criar estoque com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .post('/api/estoque')
            .set(
                'Authorization',
                'Bearer token-nivel-2'
            )
            .send({
                id_produto: 1,
                id_lote: 1,
                qtd_atual: 100,
                localizacao: 'A-01'
            });

        expect(resposta.status)
            .toBe(201);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Estoque criado'
            });

        expect(EstoqueController.criar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // POST /estoque/:id/ajuste - NÍVEL 1
    // ==========================================

    test('deve retornar 403 ao ajustar estoque com usuário nível 1', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .post('/api/estoque/5/ajuste')
            .set(
                'Authorization',
                'Bearer token-nivel-1'
            )
            .send({
                nova_quantidade: 80,
                motivo: 'Correção de inventário'
            });

        expect(resposta.status)
            .toBe(403);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Acesso negado: operação restrita a usuários com nível de acesso 2 ou superior'
            });

        expect(EstoqueController.ajustar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // POST /estoque/:id/ajuste - NÍVEL 2
    // ==========================================

    test('deve permitir ajustar estoque com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .post('/api/estoque/5/ajuste')
            .set(
                'Authorization',
                'Bearer token-nivel-2'
            )
            .send({
                nova_quantidade: 80,
                motivo: 'Correção de inventário'
            });

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Estoque ajustado',
                id: '5'
            });

        expect(EstoqueController.ajustar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // PATCH /estoque/:id - NÍVEL 1
    // ==========================================

    test('deve retornar 403 ao atualizar estoque com usuário nível 1', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 1,
            setor: 'vendas'
        });

        const resposta = await request(app)
            .patch('/api/estoque/5')
            .set(
                'Authorization',
                'Bearer token-nivel-1'
            )
            .send({
                localizacao: 'B-02'
            });

        expect(resposta.status)
            .toBe(403);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Acesso negado: operação restrita a usuários com nível de acesso 2 ou superior'
            });

        expect(EstoqueController.atualizar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // PATCH /estoque/:id - NÍVEL 2
    // ==========================================

    test('deve permitir atualizar estoque com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .patch('/api/estoque/5')
            .set(
                'Authorization',
                'Bearer token-nivel-2'
            )
            .send({
                localizacao: 'B-02'
            });

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Estoque atualizado'
            });

        expect(EstoqueController.atualizar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // DELETE /estoque/:id - NÍVEL 2
    // ==========================================

    test('deve retornar 403 ao remover estoque com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .delete('/api/estoque/5')
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

        expect(EstoqueController.remover)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // DELETE /estoque/:id - NÍVEL 3
    // ==========================================

    test('deve permitir remover estoque com gerente nível 3', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 1,
            nivel_acesso: 3,
            setor: 'gerencia'
        });

        const resposta = await request(app)
            .delete('/api/estoque/5')
            .set(
                'Authorization',
                'Bearer token-gerente'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Estoque removido'
            });

        expect(EstoqueController.remover)
            .toHaveBeenCalled();
    });
});