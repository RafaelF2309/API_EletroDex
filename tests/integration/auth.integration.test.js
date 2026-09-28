jest.mock('../../src/repositories/UsuarioRepository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../src/config/auth');

const request = require('supertest');

const app = require('../../src/app');

const UsuarioRepository =
    require('../../src/repositories/UsuarioRepository');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { getJwtSecret } =
    require('../../src/config/auth');

describe('Integração - Autenticação', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        getJwtSecret.mockReturnValue(
            'chave-secreta-teste'
        );

        process.env.JWT_EXPIRES_IN = '8h';
    });

    // ==========================================
    // LOGIN
    // ==========================================

    test('deve realizar login com credenciais válidas', async () => {

        const usuario = {
            id_usuario: 1,
            nome: 'João',
            email: 'joao@email.com',
            senha: 'hash-da-senha',
            setor: 'gerencia',
            id_cargo: 1,
            nome_cargo: 'Gerente',
            nivel_acesso: 3,
            foto_perfil: null
        };

        UsuarioRepository.buscarPorEmail
            .mockResolvedValue(usuario);

        bcrypt.compare
            .mockResolvedValue(true);

        jwt.sign
            .mockReturnValue('token-jwt-teste');

        const resposta = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'joao@email.com',
                senha: '123456'
            });

        expect(resposta.status)
            .toBe(200);

        expect(resposta.body)
            .toEqual({
                sucesso: true,
                mensagem: 'Login realizado com sucesso',
                token: 'token-jwt-teste',
                usuario: {
                    id_usuario: 1,
                    nome: 'João',
                    email: 'joao@email.com',
                    setor: 'gerencia',
                    id_cargo: 1,
                    nome_cargo: 'Gerente',
                    nivel_acesso: 3,
                    foto_perfil: null
                }
            });

        expect(
            UsuarioRepository.buscarPorEmail
        ).toHaveBeenCalledWith(
            'joao@email.com'
        );

        expect(bcrypt.compare)
            .toHaveBeenCalledWith(
                '123456',
                'hash-da-senha'
            );

        expect(jwt.sign)
            .toHaveBeenCalled();
    });

    // ==========================================
    // EMAIL FORMATADO
    // ==========================================

    test('deve formatar o e-mail antes de realizar o login', async () => {

        const usuario = {
            id_usuario: 1,
            nome: 'João',
            email: 'joao@email.com',
            senha: 'hash',
            setor: 'gerencia',
            id_cargo: 1,
            nome_cargo: 'Gerente',
            nivel_acesso: 3,
            foto_perfil: null
        };

        UsuarioRepository.buscarPorEmail
            .mockResolvedValue(usuario);

        bcrypt.compare
            .mockResolvedValue(true);

        jwt.sign
            .mockReturnValue('token');

        const resposta = await request(app)
            .post('/api/auth/login')
            .send({
                email: '  JOAO@EMAIL.COM  ',
                senha: '123456'
            });

        expect(resposta.status)
            .toBe(200);

        expect(
            UsuarioRepository.buscarPorEmail
        ).toHaveBeenCalledWith(
            'joao@email.com'
        );
    });

    // ==========================================
    // CAMPOS AUSENTES
    // ==========================================

    test('deve retornar 400 quando e-mail não for informado', async () => {

        const resposta = await request(app)
            .post('/api/auth/login')
            .send({
                senha: '123456'
            });

        expect(resposta.status)
            .toBe(400);

        expect(resposta.body.sucesso)
            .toBe(false);

        expect(resposta.body.mensagem)
            .toBe(
                'E-mail e senha são obrigatórios'
            );

        expect(
            UsuarioRepository.buscarPorEmail
        ).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando senha não for informada', async () => {

        const resposta = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'joao@email.com'
            });

        expect(resposta.status)
            .toBe(400);

        expect(resposta.body.sucesso)
            .toBe(false);

        expect(resposta.body.mensagem)
            .toBe(
                'E-mail e senha são obrigatórios'
            );

        expect(
            UsuarioRepository.buscarPorEmail
        ).not.toHaveBeenCalled();
    });

    test('deve retornar 400 quando e-mail e senha não forem informados', async () => {

        const resposta = await request(app)
            .post('/api/auth/login')
            .send({});

        expect(resposta.status)
            .toBe(400);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'E-mail e senha são obrigatórios'
            });
    });

    // ==========================================
    // USUÁRIO NÃO ENCONTRADO
    // ==========================================

    test('deve retornar 401 quando o usuário não existir', async () => {

        UsuarioRepository.buscarPorEmail
            .mockResolvedValue(null);

        const resposta = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'naoexiste@email.com',
                senha: '123456'
            });

        expect(resposta.status)
            .toBe(401);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'E-mail ou senha inválidos'
            });

        expect(bcrypt.compare)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // SENHA INCORRETA
    // ==========================================

    test('deve retornar 401 quando a senha estiver incorreta', async () => {

        UsuarioRepository.buscarPorEmail
            .mockResolvedValue({
                id_usuario: 1,
                email: 'joao@email.com',
                senha: 'hash-da-senha'
            });

        bcrypt.compare
            .mockResolvedValue(false);

        const resposta = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'joao@email.com',
                senha: 'senha-errada'
            });

        expect(resposta.status)
            .toBe(401);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'E-mail ou senha inválidos'
            });

        expect(jwt.sign)
            .not.toHaveBeenCalled();
    });

    // ==========================================
    // ERRO INTERNO
    // ==========================================

    test('deve retornar 500 quando ocorrer erro inesperado no login', async () => {

        UsuarioRepository.buscarPorEmail
            .mockRejectedValue(
                new Error('Erro no banco')
            );

        const resposta = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'joao@email.com',
                senha: '123456'
            });

        expect(resposta.status)
            .toBe(500);

        expect(resposta.body)
            .toEqual({
                sucesso: false,
                mensagem:
                    'Erro interno ao realizar login'
            });
    });
});