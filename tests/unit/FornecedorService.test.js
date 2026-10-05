jest.mock('../../src/repositories/FornecedorRepository');

const FornecedorService = require('../../src/services/FornecedorService');
const FornecedorRepository = require('../../src/repositories/FornecedorRepository');

describe('FornecedorService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // listarFornecedores
    // ==========================================

    describe('listarFornecedores', () => {

        test('deve listar todos os fornecedores', async () => {
            const fornecedores = [
                {
                    id_fornecedor: 1,
                    nome_fornecedor: 'Fornecedor A',
                    email: 'a@email.com'
                },
                {
                    id_fornecedor: 2,
                    nome_fornecedor: 'Fornecedor B',
                    email: 'b@email.com'
                }
            ];

            FornecedorRepository.listarTodos.mockResolvedValue(fornecedores);

            const resultado = await FornecedorService.listarFornecedores();

            expect(FornecedorRepository.listarTodos).toHaveBeenCalled();

            expect(resultado).toEqual({
                sucesso: true,
                dados: fornecedores,
                total: 2
            });
        });

        test('deve retornar lista vazia quando não houver fornecedores', async () => {
            FornecedorRepository.listarTodos.mockResolvedValue([]);

            const resultado = await FornecedorService.listarFornecedores();

            expect(resultado).toEqual({
                sucesso: true,
                dados: [],
                total: 0
            });
        });
    });

    // ==========================================
    // buscarFornecedorPorId
    // ==========================================

    describe('buscarFornecedorPorId', () => {

        test('deve buscar fornecedor por ID', async () => {
            const fornecedor = {
                id_fornecedor: 1,
                nome_fornecedor: 'Fornecedor A',
                email: 'a@email.com'
            };

            FornecedorRepository.buscarPorId.mockResolvedValue(fornecedor);

            const resultado =
                await FornecedorService.buscarFornecedorPorId(1);

            expect(FornecedorRepository.buscarPorId)
                .toHaveBeenCalledWith(1);

            expect(resultado).toEqual({
                sucesso: true,
                dados: fornecedor
            });
        });

        test('deve rejeitar ID inválido', async () => {
            await expect(
                FornecedorService.buscarFornecedorPorId('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

            expect(FornecedorRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar quando o ID não for informado', async () => {
            await expect(
                FornecedorService.buscarFornecedorPorId()
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });
        });

        test('deve retornar erro quando fornecedor não existir', async () => {
            FornecedorRepository.buscarPorId.mockResolvedValue(null);

            await expect(
                FornecedorService.buscarFornecedorPorId(999)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Fornecedor não encontrado'
            });
        });
    });

    // ==========================================
    // criarFornecedor
    // ==========================================

    describe('criarFornecedor', () => {

        test('deve criar um fornecedor com sucesso', async () => {
            const dados = {
                nome_fornecedor: 'Fornecedor A',
                email: 'a@email.com',
                telefone: '11999999999',
                cnpj: '12345678000199'
            };

            const fornecedorCriado = {
                id_fornecedor: 1,
                ...dados
            };

            FornecedorRepository.buscarPorCnpj
                .mockResolvedValue(null);

            FornecedorRepository.criar
                .mockResolvedValue(1);

            FornecedorRepository.buscarPorId
                .mockResolvedValue(fornecedorCriado);

            const resultado =
                await FornecedorService.criarFornecedor(dados);

            expect(FornecedorRepository.buscarPorCnpj)
                .toHaveBeenCalledWith(dados.cnpj);

            expect(FornecedorRepository.criar)
                .toHaveBeenCalledWith(dados);

            expect(FornecedorRepository.buscarPorId)
                .toHaveBeenCalledWith(1);

            expect(resultado).toEqual({
                sucesso: true,
                mensagem: 'Fornecedor cadastrado com sucesso',
                dados: fornecedorCriado
            });
        });

        test('deve rejeitar campos obrigatórios faltando', async () => {
            await expect(
                FornecedorService.criarFornecedor({})
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Campos obrigatórios faltando: nome_fornecedor, email, telefone, cnpj'
            });

            expect(FornecedorRepository.buscarPorCnpj)
                .not.toHaveBeenCalled();

            expect(FornecedorRepository.criar)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar quando o nome do fornecedor estiver faltando', async () => {
            await expect(
                FornecedorService.criarFornecedor({
                    email: 'a@email.com',
                    telefone: '11999999999',
                    cnpj: '12345678000199'
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Campos obrigatórios faltando: nome_fornecedor, email, telefone, cnpj'
            });
        });

        test('deve rejeitar quando o email estiver faltando', async () => {
            await expect(
                FornecedorService.criarFornecedor({
                    nome_fornecedor: 'Fornecedor A',
                    telefone: '11999999999',
                    cnpj: '12345678000199'
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Campos obrigatórios faltando: nome_fornecedor, email, telefone, cnpj'
            });
        });

        test('deve rejeitar quando o telefone estiver faltando', async () => {
            await expect(
                FornecedorService.criarFornecedor({
                    nome_fornecedor: 'Fornecedor A',
                    email: 'a@email.com',
                    cnpj: '12345678000199'
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Campos obrigatórios faltando: nome_fornecedor, email, telefone, cnpj'
            });
        });

        test('deve rejeitar quando o CNPJ estiver faltando', async () => {
            await expect(
                FornecedorService.criarFornecedor({
                    nome_fornecedor: 'Fornecedor A',
                    email: 'a@email.com',
                    telefone: '11999999999'
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Campos obrigatórios faltando: nome_fornecedor, email, telefone, cnpj'
            });
        });

        test('deve rejeitar CNPJ já cadastrado', async () => {
            const fornecedorExistente = {
                id_fornecedor: 1,
                nome_fornecedor: 'Fornecedor existente',
                cnpj: '12345678000199'
            };

            FornecedorRepository.buscarPorCnpj
                .mockResolvedValue(fornecedorExistente);

            await expect(
                FornecedorService.criarFornecedor({
                    nome_fornecedor: 'Fornecedor Novo',
                    email: 'novo@email.com',
                    telefone: '11999999999',
                    cnpj: '12345678000199'
                })
            ).rejects.toEqual({
                status: 409,
                mensagem:
                    'Já existe um fornecedor cadastrado com este CNPJ'
            });

            expect(FornecedorRepository.criar)
                .not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // atualizarFornecedor
    // ==========================================

    describe('atualizarFornecedor', () => {

        test('deve atualizar fornecedor com sucesso', async () => {
            const fornecedorAtualizado = {
                id_fornecedor: 1,
                nome_fornecedor: 'Fornecedor Atualizado',
                email: 'novo@email.com',
                telefone: '11888888888',
                cnpj: '12345678000199'
            };

            FornecedorRepository.buscarPorId
                .mockResolvedValueOnce({
                    id_fornecedor: 1,
                    nome_fornecedor: 'Fornecedor A'
                })
                .mockResolvedValueOnce(fornecedorAtualizado);

            const dados = {
                nome_fornecedor: 'Fornecedor Atualizado',
                email: 'novo@email.com',
                telefone: '11888888888'
            };

            const resultado =
                await FornecedorService.atualizarFornecedor(1, dados);

            expect(FornecedorRepository.buscarPorId)
                .toHaveBeenCalledWith(1);

            expect(FornecedorRepository.atualizar)
                .toHaveBeenCalledWith(1, dados);

            expect(resultado).toEqual({
                sucesso: true,
                mensagem: 'Fornecedor atualizado com sucesso',
                dados: fornecedorAtualizado
            });
        });

        test('deve rejeitar ID inválido', async () => {
            await expect(
                FornecedorService.atualizarFornecedor('abc', {
                    nome_fornecedor: 'Teste'
                })
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

            expect(FornecedorRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar quando fornecedor não existir', async () => {
            FornecedorRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                FornecedorService.atualizarFornecedor(999, {
                    nome_fornecedor: 'Teste'
                })
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Fornecedor não encontrado'
            });

            expect(FornecedorRepository.atualizar)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar quando nenhum campo for informado', async () => {
            FornecedorRepository.buscarPorId
                .mockResolvedValue({
                    id_fornecedor: 1,
                    nome_fornecedor: 'Fornecedor A'
                });

            await expect(
                FornecedorService.atualizarFornecedor(1, {})
            ).rejects.toEqual({
                status: 400,
                mensagem: 'Nenhum campo para atualizar'
            });

            expect(FornecedorRepository.atualizar)
                .not.toHaveBeenCalled();
        });

        test('deve atualizar somente o nome', async () => {
            const fornecedorAtualizado = {
                id_fornecedor: 1,
                nome_fornecedor: 'Novo Nome'
            };

            FornecedorRepository.buscarPorId
                .mockResolvedValueOnce({
                    id_fornecedor: 1,
                    nome_fornecedor: 'Nome Antigo'
                })
                .mockResolvedValueOnce(fornecedorAtualizado);

            const resultado =
                await FornecedorService.atualizarFornecedor(1, {
                    nome_fornecedor: 'Novo Nome'
                });

            expect(FornecedorRepository.atualizar)
                .toHaveBeenCalledWith(1, {
                    nome_fornecedor: 'Novo Nome'
                });

            expect(resultado.dados)
                .toEqual(fornecedorAtualizado);
        });

        test('deve atualizar somente o email', async () => {
            FornecedorRepository.buscarPorId
                .mockResolvedValueOnce({
                    id_fornecedor: 1,
                    email: 'antigo@email.com'
                })
                .mockResolvedValueOnce({
                    id_fornecedor: 1,
                    email: 'novo@email.com'
                });

            await FornecedorService.atualizarFornecedor(1, {
                email: 'novo@email.com'
            });

            expect(FornecedorRepository.atualizar)
                .toHaveBeenCalledWith(1, {
                    email: 'novo@email.com'
                });
        });

        test('deve atualizar somente o telefone', async () => {
            FornecedorRepository.buscarPorId
                .mockResolvedValueOnce({
                    id_fornecedor: 1
                })
                .mockResolvedValueOnce({
                    id_fornecedor: 1,
                    telefone: '11999999999'
                });

            await FornecedorService.atualizarFornecedor(1, {
                telefone: '11999999999'
            });

            expect(FornecedorRepository.atualizar)
                .toHaveBeenCalledWith(1, {
                    telefone: '11999999999'
                });
        });

        test('deve atualizar somente o CNPJ', async () => {
            FornecedorRepository.buscarPorId
                .mockResolvedValueOnce({
                    id_fornecedor: 1,
                    cnpj: '11111111111111'
                })
                .mockResolvedValueOnce({
                    id_fornecedor: 1,
                    cnpj: '22222222222222'
                });

            await FornecedorService.atualizarFornecedor(1, {
                cnpj: '22222222222222'
            });

            expect(FornecedorRepository.atualizar)
                .toHaveBeenCalledWith(1, {
                    cnpj: '22222222222222'
                });
        });
    });

    // ==========================================
    // removerFornecedor
    // ==========================================

    describe('removerFornecedor', () => {

        test('deve remover fornecedor com sucesso', async () => {
            FornecedorRepository.buscarPorId
                .mockResolvedValue({
                    id_fornecedor: 1,
                    nome_fornecedor: 'Fornecedor A'
                });

            FornecedorRepository.contarDependencias
                .mockResolvedValue(0);

            const resultado =
                await FornecedorService.removerFornecedor(1);

            expect(FornecedorRepository.buscarPorId)
                .toHaveBeenCalledWith(1);

            expect(FornecedorRepository.contarDependencias)
                .toHaveBeenCalledWith(1);

            expect(FornecedorRepository.remover)
                .toHaveBeenCalledWith(1);

            expect(resultado).toEqual({
                sucesso: true,
                mensagem: 'Fornecedor removido com sucesso'
            });
        });

        test('deve rejeitar ID inválido', async () => {
            await expect(
                FornecedorService.removerFornecedor('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

            expect(FornecedorRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar quando fornecedor não existir', async () => {
            FornecedorRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                FornecedorService.removerFornecedor(999)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Fornecedor não encontrado'
            });

            expect(FornecedorRepository.contarDependencias)
                .not.toHaveBeenCalled();

            expect(FornecedorRepository.remover)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar fornecedor com dependências', async () => {
            FornecedorRepository.buscarPorId
                .mockResolvedValue({
                    id_fornecedor: 1,
                    nome_fornecedor: 'Fornecedor A'
                });

            FornecedorRepository.contarDependencias
                .mockResolvedValue(3);

            await expect(
                FornecedorService.removerFornecedor(1)
            ).rejects.toEqual({
                status: 409,
                mensagem:
                    'Fornecedor possui lotes ou movimentações vinculadas e não pode ser removido'
            });

            expect(FornecedorRepository.remover)
                .not.toHaveBeenCalled();
        });
    });
});