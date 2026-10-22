jest.mock('../../src/repositories/UsuarioRepository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../src/config/auth');

const AuthService = require('../../src/services/AuthService');
const UsuarioRepository = require('../../src/repositories/UsuarioRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../../src/config/auth');

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getJwtSecret.mockReturnValue('chave-secreta-de-teste-com-mais-de-32');
        process.env.JWT_EXPIRES_IN = '8h';
        jwt.sign.mockReturnValue('token-teste');
    });

    test('deve realizar login com credenciais válidas', async () => {
        UsuarioRepository.buscarPorEmail.mockResolvedValue({
            id_usuario: 1,
            nome: 'João',
            email: 'joao@email.com',
            senha: 'hash-da-senha',
            setor: 'gerencia',
            id_cargo: 1,
            nome_cargo: 'Gerente',
            nivel_acesso: 3,
            foto_perfil: null
        });
        bcrypt.compare.mockResolvedValue(true);

        const resposta = await AuthService.login({
            email: ' JOAO@EMAIL.COM ',
            senha: '123456'
        });

        expect(resposta).toEqual(expect.objectContaining({
            sucesso: true,
            mensagem: 'Login realizado com sucesso',
            token: 'token-teste'
        }));
        expect(resposta.usuario).toEqual(expect.objectContaining({
            id_usuario: 1,
            email: 'joao@email.com',
            nivel_acesso: 3
        }));
        expect(UsuarioRepository.buscarPorEmail).toHaveBeenCalledWith('joao@email.com');
        expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hash-da-senha');
        expect(getJwtSecret).toHaveBeenCalled();
        expect(jwt.sign).toHaveBeenCalled();
    });

    test('deve rejeitar e-mail ausente', async () => {
        await expect(AuthService.login({ senha: '123456' }))
            .rejects.toEqual({
                status: 400,
                mensagem: 'E-mail e senha são obrigatórios'
            });
    });

    test('deve rejeitar senha ausente', async () => {
        await expect(AuthService.login({ email: 'teste@email.com' }))
            .rejects.toEqual({
                status: 400,
                mensagem: 'E-mail e senha são obrigatórios'
            });
    });

    test('deve rejeitar usuário inexistente', async () => {
        UsuarioRepository.buscarPorEmail.mockResolvedValue(undefined);

        await expect(AuthService.login({
            email: 'naoexiste@email.com',
            senha: '123456'
        })).rejects.toEqual({
            status: 401,
            mensagem: 'E-mail ou senha inválidos'
        });

        expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    test('deve rejeitar senha incorreta', async () => {
        UsuarioRepository.buscarPorEmail.mockResolvedValue({
            id_usuario: 1,
            email: 'teste@email.com',
            senha: 'hash'
        });
        bcrypt.compare.mockResolvedValue(false);

        await expect(AuthService.login({
            email: 'teste@email.com',
            senha: 'errada'
        })).rejects.toEqual({
            status: 401,
            mensagem: 'E-mail ou senha inválidos'
        });

        expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('deve propagar erro inesperado do banco', async () => {
        UsuarioRepository.buscarPorEmail.mockRejectedValue(new Error('Erro no banco'));

        await expect(AuthService.login({
            email: 'teste@email.com',
            senha: '123456'
        })).rejects.toEqual(new Error('Erro no banco'));
    });
});
