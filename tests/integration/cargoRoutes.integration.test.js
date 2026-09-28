jest.mock('../../src/controllers/CargoController');
jest.mock('jsonwebtoken');
jest.mock('../../src/config/auth');

const request = require('supertest');
const app = require('../../src/app');

const CargoController =
    require('../../src/controllers/CargoController');

const jwt = require('jsonwebtoken');

const { getJwtSecret } =
    require('../../src/config/auth');

describe('Integração - Rotas de Cargos', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        getJwtSecret.mockReturnValue(
            'chave-secreta-teste'
        );

        CargoController.listar.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Cargos listados'
                });
            }
        );

        CargoController.buscarPorId.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Cargo encontrado',
                    id: req.params.id
                });
            }
        );

        CargoController.criar.mockImplementation(
            (req, res) => {
                res.status(201).json({
                    sucesso: true,
                    mensagem: 'Cargo criado'
                });
            }
        );

        CargoController.atualizar.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Cargo atualizado'
                });
            }
        );

        CargoController.remover.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Cargo removido'
                });
            }
        );
    });

    // ==========================================
    // GET /cargos
    // ==========================================

    test('deve permitir listar cargos sem token', async () => {

        const resposta = await request(app)
            .get('/api/cargos');

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Cargos listados'
            });

        expect(CargoController.listar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // GET /cargos/:id
    // ==========================================

    test('deve permitir buscar cargo por ID sem token', async () => {

        const resposta = await request(app)
            .get('/api/cargos/5');

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Cargo encontrado',
                id: '5'
            });

        expect(CargoController.buscarPorId)
            .toHaveBeenCalled();
    });

    // ==========================================
    // POST /cargos - SEM TOKEN
    // ==========================================

    test('deve retornar 401 ao criar cargo sem token', async () => {

        const resposta = await request(app)
            .post('/api/cargos')
            .send({
                nome_cargo: 'Supervisor',
                descricao: 'Cargo de supervisor',
                nivel_acesso: 2
            });

        expect(resposta.status)
            .toBe(401);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Token de autenticação não informado'
            });

        expect(CargoController.criar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // POST /cargos - NÍVEL 2
    // ==========================================

    test('deve retornar 403 ao criar cargo com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .post('/api/cargos')
            .set(
                'Authorization',
                'Bearer token-nivel-2'
            )
            .send({
                nome_cargo: 'Supervisor',
                descricao: 'Cargo de supervisor',
                nivel_acesso: 2
            });

        expect(resposta.status)
            .toBe(403);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Acesso negado: operação restrita a usuários com nível de acesso 3 ou superior'
            });

        expect(CargoController.criar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // POST /cargos - NÍVEL 3
    // ==========================================

    test('deve permitir gerente nível 3 criar cargo', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 1,
            nivel_acesso: 3,
            setor: 'gerencia'
        });

        const resposta = await request(app)
            .post('/api/cargos')
            .set(
                'Authorization',
                'Bearer token-gerente'
            )
            .send({
                nome_cargo: 'Supervisor',
                descricao: 'Cargo de supervisor',
                nivel_acesso: 2
            });

        expect(resposta.status)
            .toBe(201);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Cargo criado'
            });

        expect(CargoController.criar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // PATCH /cargos/:id - NÍVEL 2
    // ==========================================

    test('deve retornar 403 ao atualizar cargo com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .patch('/api/cargos/5')
            .set(
                'Authorization',
                'Bearer token-nivel-2'
            )
            .send({
                nome_cargo: 'Supervisor Atualizado'
            });

        expect(resposta.status)
            .toBe(403);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Acesso negado: operação restrita a usuários com nível de acesso 3 ou superior'
            });

        expect(CargoController.atualizar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // PATCH /cargos/:id - NÍVEL 3
    // ==========================================

    test('deve permitir gerente nível 3 atualizar cargo', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 1,
            nivel_acesso: 3,
            setor: 'gerencia'
        });

        const resposta = await request(app)
            .patch('/api/cargos/5')
            .set(
                'Authorization',
                'Bearer token-gerente'
            )
            .send({
                nome_cargo: 'Supervisor Atualizado'
            });

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Cargo atualizado'
            });

        expect(CargoController.atualizar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // DELETE /cargos/:id - NÍVEL 2
    // ==========================================

    test('deve retornar 403 ao remover cargo com usuário nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .delete('/api/cargos/5')
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

        expect(CargoController.remover)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // DELETE /cargos/:id - NÍVEL 3
    // ==========================================

    test('deve permitir gerente nível 3 remover cargo', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 1,
            nivel_acesso: 3,
            setor: 'gerencia'
        });

        const resposta = await request(app)
            .delete('/api/cargos/5')
            .set(
                'Authorization',
                'Bearer token-gerente'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Cargo removido'
            });

        expect(CargoController.remover)
            .toHaveBeenCalled();
    });
});