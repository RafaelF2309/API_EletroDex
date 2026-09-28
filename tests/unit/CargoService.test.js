jest.mock('../../src/config/database', () => ({
    query: jest.fn()
}));

jest.mock('../../src/repositories/CargoRepository');

const CargoService = require('../../src/services/CargoService');
const CargoRepository = require('../../src/repositories/CargoRepository');
const pool = require('../../src/config/database');

describe('CargoService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listarCargos', () => {

        test('deve listar todos os cargos', async () => {

            const cargos = [
                {
                    id_cargo: 1,
                    nome_cargo: 'Gerente',
                    nivel_acesso: 3
                },
                {
                    id_cargo: 2,
                    nome_cargo: 'Estoquista',
                    nivel_acesso: 2
                }
            ];

            CargoRepository.listarTodos.mockResolvedValue(cargos);

            const resultado = await CargoService.listarCargos();

            expect(resultado.sucesso).toBe(true);
            expect(resultado.dados).toEqual(cargos);
            expect(resultado.total).toBe(2);

            expect(
                CargoRepository.listarTodos
            ).toHaveBeenCalled();
        });

    });

    describe('buscarCargoPorId', () => {

        test('deve retornar o cargo quando ele existir', async () => {

            const cargo = {
                id_cargo: 1,
                nome_cargo: 'Gerente',
                descricao: 'Responsável pela gerência',
                nivel_acesso: 3
            };

            CargoRepository.buscarPorId.mockResolvedValue(cargo);

            const resultado =
                await CargoService.buscarCargoPorId(1);

            expect(resultado.sucesso).toBe(true);
            expect(resultado.dados).toEqual(cargo);

            expect(
                CargoRepository.buscarPorId
            ).toHaveBeenCalledWith(1);
        });

        test('deve lançar erro quando o cargo não existir', async () => {

            CargoRepository.buscarPorId.mockResolvedValue(null);

            await expect(
                CargoService.buscarCargoPorId(999)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Cargo não encontrado'
            });
        });

        test('deve rejeitar ID inválido', async () => {

            await expect(
                CargoService.buscarCargoPorId('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });
        });

    });

    describe('criarCargo', () => {

        test('deve criar um novo cargo', async () => {

            CargoRepository.buscarPorNome
                .mockResolvedValueOnce(null);

            CargoRepository.criar
                .mockResolvedValue(4);

            CargoRepository.buscarPorId
                .mockResolvedValue({
                    id_cargo: 4,
                    nome_cargo: 'Supervisor',
                    descricao: 'Supervisor do estoque',
                    nivel_acesso: 2
                });

            const resultado =
                await CargoService.criarCargo({
                    nome_cargo: 'Supervisor',
                    descricao: 'Supervisor do estoque',
                    nivel_acesso: 2
                });

            expect(resultado.sucesso).toBe(true);

            expect(resultado.mensagem)
                .toBe('Cargo cadastrado com sucesso');

            expect(resultado.dados.id_cargo)
                .toBe(4);

            expect(
                CargoRepository.criar
            ).toHaveBeenCalledWith({
                nome_cargo: 'Supervisor',
                descricao: 'Supervisor do estoque',
                nivel_acesso: 2
            });
        });

        test('deve rejeitar cargo sem nome', async () => {

            await expect(
                CargoService.criarCargo({})
            ).rejects.toEqual({
                status: 400,
                mensagem: 'Campos obrigatórios faltando: nome_cargo'
            });

        });

        test('deve rejeitar cargo duplicado', async () => {

            CargoRepository.buscarPorNome
                .mockResolvedValue({
                    id_cargo: 1,
                    nome_cargo: 'Gerente'
                });

            await expect(
                CargoService.criarCargo({
                    nome_cargo: 'Gerente'
                })
            ).rejects.toEqual({
                status: 409,
                mensagem:
                    'Já existe um cargo cadastrado com este nome'
            });

        });

        test('deve rejeitar nível de acesso menor que 1', async () => {

            CargoRepository.buscarPorNome
                .mockResolvedValue(null);

            await expect(
                CargoService.criarCargo({
                    nome_cargo: 'Supervisor',
                    nivel_acesso: 0
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Nível de acesso deve ser um número inteiro entre 1 e 3'
            });

        });

        test('deve rejeitar nível de acesso maior que 3', async () => {

            CargoRepository.buscarPorNome
                .mockResolvedValue(null);

            await expect(
                CargoService.criarCargo({
                    nome_cargo: 'Diretor',
                    nivel_acesso: 4
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Nível de acesso deve ser um número inteiro entre 1 e 3'
            });

        });

    });

    describe('atualizarCargo', () => {

        test('deve atualizar um cargo existente', async () => {

            const cargoAtual = {
                id_cargo: 1,
                nome_cargo: 'Gerente',
                descricao: 'Gerente atual',
                nivel_acesso: 3
            };

            const cargoAtualizado = {
                id_cargo: 1,
                nome_cargo: 'Gerente Geral',
                descricao: 'Gerente geral',
                nivel_acesso: 3
            };

            CargoRepository.buscarPorId
                .mockResolvedValueOnce(cargoAtual)
                .mockResolvedValueOnce(cargoAtualizado);

            CargoRepository.atualizar
                .mockResolvedValue(true);

            const resultado =
                await CargoService.atualizarCargo(1, {
                    nome_cargo: 'Gerente Geral',
                    descricao: 'Gerente geral'
                });

            expect(resultado.sucesso).toBe(true);

            expect(resultado.mensagem)
                .toBe('Cargo atualizado com sucesso');

            expect(resultado.dados)
                .toEqual(cargoAtualizado);

            expect(
                CargoRepository.atualizar
            ).toHaveBeenCalledWith(1, {
                nome_cargo: 'Gerente Geral',
                descricao: 'Gerente geral'
            });
        });

        test('deve rejeitar ID inválido', async () => {

            await expect(
                CargoService.atualizarCargo('abc', {
                    nome_cargo: 'Novo cargo'
                })
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

        });

        test('deve rejeitar cargo que não existe', async () => {

            CargoRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                CargoService.atualizarCargo(999, {
                    nome_cargo: 'Novo cargo'
                })
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Cargo não encontrado'
            });

        });

        test('deve rejeitar nome vazio', async () => {

            CargoRepository.buscarPorId
                .mockResolvedValue({
                    id_cargo: 1,
                    nome_cargo: 'Gerente',
                    nivel_acesso: 3
                });

            await expect(
                CargoService.atualizarCargo(1, {
                    nome_cargo: ''
                })
            ).rejects.toEqual({
                status: 400,
                mensagem: 'O nome do cargo não pode ser vazio'
            });

        });

        test('deve rejeitar nível de acesso inválido', async () => {

            CargoRepository.buscarPorId
                .mockResolvedValue({
                    id_cargo: 1,
                    nome_cargo: 'Gerente',
                    nivel_acesso: 3
                });

            await expect(
                CargoService.atualizarCargo(1, {
                    nivel_acesso: 5
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Nível de acesso deve ser um número inteiro entre 1 e 3'
            });

        });

        test('deve rejeitar quando nenhum campo for informado', async () => {

            CargoRepository.buscarPorId
                .mockResolvedValue({
                    id_cargo: 1,
                    nome_cargo: 'Gerente',
                    nivel_acesso: 3
                });

            await expect(
                CargoService.atualizarCargo(1, {})
            ).rejects.toEqual({
                status: 400,
                mensagem: 'Nenhum campo para atualizar'
            });

        });

        test('deve rejeitar nome duplicado', async () => {

            CargoRepository.buscarPorId
                .mockResolvedValue({
                    id_cargo: 1,
                    nome_cargo: 'Gerente',
                    nivel_acesso: 3
                });

            CargoRepository.buscarPorNome
                .mockResolvedValue({
                    id_cargo: 2,
                    nome_cargo: 'Estoquista',
                    nivel_acesso: 2
                });

            await expect(
                CargoService.atualizarCargo(1, {
                    nome_cargo: 'Estoquista'
                })
            ).rejects.toEqual({
                status: 409,
                mensagem:
                    'Já existe outro cargo cadastrado com este nome'
            });

        });

    });

    describe('removerCargo', () => {

        test('deve remover um cargo sem usuários vinculados', async () => {

            CargoRepository.buscarPorId
                .mockResolvedValue({
                    id_cargo: 4,
                    nome_cargo: 'Supervisor',
                    nivel_acesso: 2
                });

            pool.query
                .mockResolvedValue([
                    [{ total: 0 }],
                    []
                ]);

            CargoRepository.remover
                .mockResolvedValue(true);

            const resultado =
                await CargoService.removerCargo(4);

            expect(resultado.sucesso).toBe(true);

            expect(resultado.mensagem)
                .toBe('Cargo removido com sucesso');

            expect(
                CargoRepository.remover
            ).toHaveBeenCalledWith(4);

        });

        test('deve rejeitar ID inválido', async () => {

            await expect(
                CargoService.removerCargo('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

        });

        test('deve rejeitar cargo que não existe', async () => {

            CargoRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                CargoService.removerCargo(999)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Cargo não encontrado'
            });

        });

        test('deve rejeitar remoção quando existem usuários vinculados', async () => {

            CargoRepository.buscarPorId
                .mockResolvedValue({
                    id_cargo: 1,
                    nome_cargo: 'Gerente',
                    nivel_acesso: 3
                });

            pool.query
                .mockResolvedValue([
                    [{ total: 2 }],
                    []
                ]);

            await expect(
                CargoService.removerCargo(1)
            ).rejects.toEqual({
                status: 409,
                mensagem:
                    'Cargo está vinculado a um ou mais usuários e não pode ser removido'
            });

            expect(
                CargoRepository.remover
            ).not.toHaveBeenCalled();

        });

    });

});