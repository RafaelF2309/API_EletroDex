jest.mock('../../src/controllers/ProdutoController');
jest.mock('../../src/repositories/CargoRepository');
jest.mock('jsonwebtoken');
jest.mock('../../src/config/auth');

const request = require('supertest');

const app = require('../../src/app');

const ProdutoController =
    require('../../src/controllers/ProdutoController');

const jwt = require('jsonwebtoken');

const { getJwtSecret } =
    require('../../src/config/auth');

describe('Integração - Rotas de Produtos', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        getJwtSecret.mockReturnValue(
            'chave-secreta-teste'
        );

        ProdutoController.listar.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Produtos listados'
                });
            }
        );

        ProdutoController.buscarPorId.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Produto encontrado',
                    id: req.params.id
                });
            }
        );

        ProdutoController.remover.mockImplementation(
            (req, res) => {
                res.status(200).json({
                    sucesso: true,
                    mensagem: 'Produto removido'
                });
            }
        );
    });

    // ==========================================
    // SEM TOKEN
    // ==========================================

    test('deve retornar 401 ao acessar produtos sem token', async () => {

        const resposta = await request(app)
            .get('/api/produtos');

        expect(resposta.status)
            .toBe(401);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Token de autenticação não informado'
            });

        expect(ProdutoController.listar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // FORMATO INVÁLIDO
    // ==========================================

    test('deve retornar 401 quando o token estiver em formato inválido', async () => {

        const resposta = await request(app)
            .get('/api/produtos')
            .set(
                'Authorization',
                'Token abc123'
            );

        expect(resposta.status)
            .toBe(401);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Formato do token inválido'
            });

        expect(ProdutoController.listar)
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
            .get('/api/produtos')
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

        expect(ProdutoController.listar)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // NÍVEL INSUFICIENTE
    // DELETE EXIGE NÍVEL 3
    // ==========================================

    test('deve retornar 403 para usuário sem nível suficiente ao remover produto', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .delete('/api/produtos/15')
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

        expect(ProdutoController.remover)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // NÍVEL 2 PODE CONSULTAR
    // ==========================================

    test('deve permitir consulta de produtos para usuário com nível 2', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .get('/api/produtos')
            .set(
                'Authorization',
                'Bearer token-valido'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Produtos listados'
            });

        expect(ProdutoController.listar)
            .toHaveBeenCalled();
    });

    // ==========================================
    // GERENTE NÍVEL 3
    // ==========================================

    test('deve permitir gerente nível 3 remover produto', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 1,
            nivel_acesso: 3,
            setor: 'gerencia'
        });

        const resposta = await request(app)
            .delete('/api/produtos/15')
            .set(
                'Authorization',
                'Bearer token-gerente'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Produto removido'
            });

        expect(ProdutoController.remover)
            .toHaveBeenCalled();
    });

    // ==========================================
    // BUSCAR PRODUTO POR ID
    // ==========================================

    test('deve permitir buscar produto por ID com token válido', async () => {

        jwt.verify.mockReturnValue({
            id_usuario: 10,
            nivel_acesso: 2,
            setor: 'estoque'
        });

        const resposta = await request(app)
            .get('/api/produtos/15')
            .set(
                'Authorization',
                'Bearer token-valido'
            );

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Produto encontrado',
                id: '15'
            });

        expect(ProdutoController.buscarPorId)
            .toHaveBeenCalled();
    });
});