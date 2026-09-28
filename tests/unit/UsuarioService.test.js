jest.mock('../../src/repositories/UsuarioRepository');
jest.mock('../../src/repositories/CargoRepository');
jest.mock('bcrypt');

const UsuarioService = require('../../src/services/UsuarioService');
const UsuarioRepository = require('../../src/repositories/UsuarioRepository');
const CargoRepository = require('../../src/repositories/CargoRepository');
const bcrypt = require('bcrypt');

describe('UsuarioService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listarUsuarios', () => {

        test('deve listar todos os usuários', async () => {

            const usuarios = [
                {
                    id_usuario: 1,
                    nome: 'João',
                    email: 'joao@email.com',
                    setor: 'gerencia',
                    id_cargo: 1
                },
                {
                    id_usuario: 2,
                    nome: 'Maria',
                    email: 'maria@email.com',
                    setor: 'estoque',
                    id_cargo: 2
                }
            ];

            UsuarioRepository.listarTodos
                .mockResolvedValue(usuarios);

            const resultado =
                await UsuarioService.listarUsuarios();

            expect(resultado.sucesso).toBe(true);
            expect(resultado.dados).toEqual(usuarios);
            expect(resultado.total).toBe(2);

            expect(
                UsuarioRepository.listarTodos
            ).toHaveBeenCalled();
        });

    });

    describe('buscarUsuarioPorId', () => {

        test('deve retornar o usuário quando ele existir', async () => {

            const usuario = {
                id_usuario: 1,
                nome: 'João',
                email: 'joao@email.com',
                setor: 'gerencia',
                id_cargo: 1
            };

            UsuarioRepository.buscarPorId
                .mockResolvedValue(usuario);

            const resultado =
                await UsuarioService.buscarUsuarioPorId(1);

            expect(resultado.sucesso).toBe(true);
            expect(resultado.dados).toEqual(usuario);

            expect(
                UsuarioRepository.buscarPorId
            ).toHaveBeenCalledWith(1);
        });

        test('deve rejeitar ID inválido', async () => {

            await expect(
                UsuarioService.buscarUsuarioPorId('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

        });

        test('deve rejeitar usuário que não existe', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                UsuarioService.buscarUsuarioPorId(999)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Usuário não encontrado'
            });

        });

    });

    describe('criarUsuario', () => {

        test('deve criar um usuário com sucesso', async () => {

            CargoRepository.buscarPorId
                .mockResolvedValue({
                    id_cargo: 2,
                    nome_cargo: 'Estoquista',
                    nivel_acesso: 2
                });

            UsuarioRepository.buscarPorEmail
                .mockResolvedValue(null);

            bcrypt.hash
                .mockResolvedValue('senha_hash');

            UsuarioRepository.criar
                .mockResolvedValue(10);

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 10,
                    nome: 'João',
                    email: 'joao@email.com',
                    setor: 'estoque',
                    id_cargo: 2
                });

            const resultado =
                await UsuarioService.criarUsuario({
                    nome: 'João',
                    email: 'JOAO@EMAIL.COM',
                    senha: '123456',
                    setor: 'estoque',
                    id_cargo: 2
                });

            expect(resultado.sucesso).toBe(true);

            expect(resultado.mensagem)
                .toBe('Usuário cadastrado com sucesso');

            expect(resultado.dados.id_usuario)
                .toBe(10);

            expect(
                bcrypt.hash
            ).toHaveBeenCalledWith('123456', 10);

            expect(
                UsuarioRepository.criar
            ).toHaveBeenCalledWith({
                nome: 'João',
                email: 'joao@email.com',
                senha: 'senha_hash',
                setor: 'estoque',
                id_cargo: 2,
                foto_perfil: null
            });

        });

        test('deve rejeitar campos obrigatórios faltando', async () => {

            await expect(
                UsuarioService.criarUsuario({})
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Campos obrigatórios faltando: nome, email, senha, setor e id_cargo'
            });

        });

        test('deve rejeitar id_cargo inválido', async () => {

            await expect(
                UsuarioService.criarUsuario({
                    nome: 'João',
                    email: 'joao@email.com',
                    senha: '123456',
                    setor: 'estoque',
                    id_cargo: 'abc'
                })
            ).rejects.toEqual({
                status: 400,
                mensagem: 'id_cargo inválido'
            });

        });

        test('deve rejeitar cargo inexistente', async () => {

            CargoRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                UsuarioService.criarUsuario({
                    nome: 'João',
                    email: 'joao@email.com',
                    senha: '123456',
                    setor: 'estoque',
                    id_cargo: 999
                })
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Cargo informado não existe'
            });

        });

        test('deve rejeitar e-mail duplicado', async () => {

            CargoRepository.buscarPorId
                .mockResolvedValue({
                    id_cargo: 2,
                    nome_cargo: 'Estoquista'
                });

            UsuarioRepository.buscarPorEmail
                .mockResolvedValue({
                    id_usuario: 1,
                    email: 'joao@email.com'
                });

            await expect(
                UsuarioService.criarUsuario({
                    nome: 'João',
                    email: 'JOAO@EMAIL.COM',
                    senha: '123456',
                    setor: 'estoque',
                    id_cargo: 2
                })
            ).rejects.toEqual({
                status: 409,
                mensagem:
                    'Já existe um usuário cadastrado com este e-mail'
            });

        });

    });

    describe('atualizarUsuario', () => {

        test('deve atualizar um usuário com sucesso', async () => {

            const usuarioAtual = {
                id_usuario: 1,
                nome: 'João',
                email: 'joao@email.com',
                setor: 'estoque',
                id_cargo: 2
            };

            const usuarioAtualizado = {
                id_usuario: 1,
                nome: 'João Silva',
                email: 'joao.silva@email.com',
                setor: 'estoque',
                id_cargo: 2
            };

            UsuarioRepository.buscarPorId
                .mockResolvedValueOnce(usuarioAtual)
                .mockResolvedValueOnce(usuarioAtualizado);

            UsuarioRepository.buscarPorEmail
                .mockResolvedValue(null);

            UsuarioRepository.atualizar
                .mockResolvedValue(true);

            const resultado =
                await UsuarioService.atualizarUsuario(1, {
                    nome: 'João Silva',
                    email: 'joao.silva@email.com'
                });

            expect(resultado.sucesso).toBe(true);

            expect(resultado.mensagem)
                .toBe('Usuário atualizado com sucesso');

            expect(resultado.dados)
                .toEqual(usuarioAtualizado);

            expect(
                UsuarioRepository.atualizar
            ).toHaveBeenCalledWith(1, {
                nome: 'João Silva',
                email: 'joao.silva@email.com'
            });

        });

        test('deve rejeitar ID inválido', async () => {

            await expect(
                UsuarioService.atualizarUsuario('abc', {
                    nome: 'Novo nome'
                })
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

        });

        test('deve rejeitar usuário inexistente', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                UsuarioService.atualizarUsuario(999, {
                    nome: 'Novo nome'
                })
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Usuário não encontrado'
            });

        });

        test('deve rejeitar nome vazio', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1,
                    nome: 'João',
                    email: 'joao@email.com'
                });

            await expect(
                UsuarioService.atualizarUsuario(1, {
                    nome: ''
                })
            ).rejects.toEqual({
                status: 400,
                mensagem: 'O nome não pode ser vazio'
            });

        });

        test('deve rejeitar e-mail vazio', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1,
                    nome: 'João',
                    email: 'joao@email.com'
                });

            await expect(
                UsuarioService.atualizarUsuario(1, {
                    email: ''
                })
            ).rejects.toEqual({
                status: 400,
                mensagem: 'O e-mail não pode ser vazio'
            });

        });

        test('deve rejeitar e-mail duplicado', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1,
                    nome: 'João',
                    email: 'joao@email.com'
                });

            UsuarioRepository.buscarPorEmail
                .mockResolvedValue({
                    id_usuario: 2,
                    email: 'maria@email.com'
                });

            await expect(
                UsuarioService.atualizarUsuario(1, {
                    email: 'maria@email.com'
                })
            ).rejects.toEqual({
                status: 409,
                mensagem:
                    'Já existe outro usuário cadastrado com este e-mail'
            });

        });

        test('deve rejeitar setor inválido', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1,
                    nome: 'João',
                    email: 'joao@email.com',
                    setor: 'estoque'
                });

            await expect(
                UsuarioService.atualizarUsuario(1, {
                    setor: 'financeiro'
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Setor inválido. Use: gerencia, estoque ou vendas'
            });

        });

        test('deve rejeitar cargo inexistente', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1,
                    nome: 'João',
                    email: 'joao@email.com',
                    id_cargo: 2
                });

            CargoRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                UsuarioService.atualizarUsuario(1, {
                    id_cargo: 999
                })
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Cargo informado não existe'
            });

        });

        test('deve rejeitar quando nenhum campo for informado', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1,
                    nome: 'João',
                    email: 'joao@email.com'
                });

            await expect(
                UsuarioService.atualizarUsuario(1, {})
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Nenhum campo válido para atualizar'
            });

        });

        test('deve atualizar a senha usando bcrypt', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValueOnce({
                    id_usuario: 1,
                    nome: 'João',
                    email: 'joao@email.com'
                })
                .mockResolvedValueOnce({
                    id_usuario: 1,
                    nome: 'João',
                    email: 'joao@email.com'
                });

            bcrypt.hash
                .mockResolvedValue('nova_senha_hash');

            UsuarioRepository.atualizar
                .mockResolvedValue(true);

            await UsuarioService.atualizarUsuario(1, {
                senha: 'nova123'
            });

            expect(
                bcrypt.hash
            ).toHaveBeenCalledWith('nova123', 10);

            expect(
                UsuarioRepository.atualizar
            ).toHaveBeenCalledWith(1, {
                senha: 'nova_senha_hash'
            });

        });

    });

    describe('removerUsuario', () => {

        test('deve remover usuário sem dependências', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1,
                    nome: 'João',
                    email: 'joao@email.com'
                });

            UsuarioRepository.contarDependencias
                .mockResolvedValue(0);

            UsuarioRepository.remover
                .mockResolvedValue(true);

            const resultado =
                await UsuarioService.removerUsuario(1);

            expect(resultado.sucesso).toBe(true);

            expect(resultado.mensagem)
                .toBe('Usuário removido com sucesso');

            expect(
                UsuarioRepository.remover
            ).toHaveBeenCalledWith(1);

        });

        test('deve rejeitar ID inválido', async () => {

            await expect(
                UsuarioService.removerUsuario('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

        });

        test('deve rejeitar usuário inexistente', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                UsuarioService.removerUsuario(999)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Usuário não encontrado'
            });

        });

        test('deve rejeitar usuário com dependências', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1,
                    nome: 'João',
                    email: 'joao@email.com'
                });

            UsuarioRepository.contarDependencias
                .mockResolvedValue(2);

            await expect(
                UsuarioService.removerUsuario(1)
            ).rejects.toEqual({
                status: 409,
                mensagem:
                    'Usuário possui movimentações ou ajustes vinculados e não pode ser removido'
            });

            expect(
                UsuarioRepository.remover
            ).not.toHaveBeenCalled();

        });

    });

});