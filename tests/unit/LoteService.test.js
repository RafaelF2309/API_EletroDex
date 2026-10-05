jest.mock('../../src/repositories/LoteRepository');
jest.mock('../../src/repositories/ProdutoRepository');
jest.mock('../../src/repositories/FornecedorRepository');

const LoteService = require('../../src/services/LoteService');

const LoteRepository = require('../../src/repositories/LoteRepository');
const ProdutoRepository = require('../../src/repositories/ProdutoRepository');
const FornecedorRepository = require('../../src/repositories/FornecedorRepository');

LoteRepository.criarComEstoque = jest.fn();

describe('LoteService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // listarLotes
    // ==========================================

    describe('listarLotes', () => {

        test('deve listar todos os lotes', async () => {
            const lotes = [
                {
                    id_lote: 1,
                    numero_lote: 'LOTE001'
                },
                {
                    id_lote: 2,
                    numero_lote: 'LOTE002'
                }
            ];

            LoteRepository.listarTodos.mockResolvedValue(lotes);

            const resultado = await LoteService.listarLotes();

            expect(LoteRepository.listarTodos)
                .toHaveBeenCalled();

            expect(resultado).toEqual({
                sucesso: true,
                dados: lotes,
                total: 2
            });
        });

        test('deve retornar lista vazia quando não houver lotes', async () => {
            LoteRepository.listarTodos.mockResolvedValue([]);

            const resultado = await LoteService.listarLotes();

            expect(resultado).toEqual({
                sucesso: true,
                dados: [],
                total: 0
            });
        });
    });

    // ==========================================
    // buscarLotePorId
    // ==========================================

    describe('buscarLotePorId', () => {

        test('deve buscar lote por ID', async () => {
            const lote = {
                id_lote: 1,
                numero_lote: 'LOTE001'
            };

            LoteRepository.buscarPorId.mockResolvedValue(lote);

            const resultado =
                await LoteService.buscarLotePorId(1);

            expect(LoteRepository.buscarPorId)
                .toHaveBeenCalledWith(1);

            expect(resultado).toEqual({
                sucesso: true,
                dados: lote
            });
        });

        test('deve rejeitar ID inválido', async () => {
            await expect(
                LoteService.buscarLotePorId('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

            expect(LoteRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar quando o ID não for informado', async () => {
            await expect(
                LoteService.buscarLotePorId()
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });
        });

        test('deve rejeitar quando o lote não existir', async () => {
            LoteRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                LoteService.buscarLotePorId(999)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Lote não encontrado'
            });
        });
    });

    // ==========================================
    // criarLote
    // ==========================================

    describe('criarLote', () => {

        const dadosValidos = {
            id_produto: 1,
            numero_lote: 'LOTE001',
            dt_fabricacao: '2026-01-01',
            dt_validade: '2027-01-01',
            quantidade_inicial: 100,
            id_fornecedor: 1,
            localizacao_corredor: 'A',
            localizacao_prateleira: '01'
        };

        test('deve criar lote e estoque inicial com sucesso', async () => {
            const loteCriado = {
                id_lote: 10,
                ...dadosValidos
            };

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 1
                });

            FornecedorRepository.buscarPorId
                .mockResolvedValue({
                    id_fornecedor: 1
                });

            LoteRepository.buscarPorNumeroLote
                .mockResolvedValue(null);

            LoteRepository.criarComEstoque
                .mockResolvedValue(10);

            LoteRepository.buscarPorId
                .mockResolvedValue(loteCriado);

            const resultado =
                await LoteService.criarLote(dadosValidos);

            expect(LoteRepository.criarComEstoque)
                .toHaveBeenCalledWith(
                    {
                        id_produto: 1,
                        numero_lote: 'LOTE001',
                        dt_fabricacao: '2026-01-01',
                        dt_validade: '2027-01-01',
                        quantidade_inicial: 100,
                        id_fornecedor: 1
                    },
                    {
                        id_produto: 1,
                        qtd_atual: 100,
                        localizacao_corredor: 'A',
                        localizacao_prateleira: '01'
                    }
                );

            expect(resultado).toEqual({
                sucesso: true,
                mensagem:
                    'Lote e estoque inicial cadastrados com sucesso',
                dados: loteCriado
            });
        });

        test('deve usar PENDENTE quando localização não for informada', async () => {
            const dados = {
                ...dadosValidos
            };

            delete dados.localizacao_corredor;
            delete dados.localizacao_prateleira;

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 1
                });

            FornecedorRepository.buscarPorId
                .mockResolvedValue({
                    id_fornecedor: 1
                });

            LoteRepository.buscarPorNumeroLote
                .mockResolvedValue(null);

            LoteRepository.criarComEstoque
                .mockResolvedValue(10);

            LoteRepository.buscarPorId
                .mockResolvedValue({
                    id_lote: 10
                });

            await LoteService.criarLote(dados);

            expect(LoteRepository.criarComEstoque)
                .toHaveBeenCalledWith(
                    expect.any(Object),
                    {
                        id_produto: 1,
                        qtd_atual: 100,
                        localizacao_corredor: 'PENDENTE',
                        localizacao_prateleira: 'PENDENTE'
                    }
                );
        });

        test('deve rejeitar campos obrigatórios faltando', async () => {
            const dados = {
                id_produto: 1
            };

            await expect(
                LoteService.criarLote(dados)
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Campos obrigatórios faltando: id_produto, numero_lote, dt_fabricacao, dt_validade, quantidade_inicial, id_fornecedor'
            });

            expect(ProdutoRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar quantidade inicial zero', async () => {
            const dados = {
                ...dadosValidos,
                quantidade_inicial: 0
            };

            await expect(
                LoteService.criarLote(dados)
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'quantidade_inicial deve ser um número inteiro maior que zero'
            });
        });

        test('deve rejeitar quantidade inicial negativa', async () => {
            const dados = {
                ...dadosValidos,
                quantidade_inicial: -10
            };

            await expect(
                LoteService.criarLote(dados)
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'quantidade_inicial deve ser um número inteiro maior que zero'
            });
        });

        test('deve rejeitar quantidade inicial decimal', async () => {
            const dados = {
                ...dadosValidos,
                quantidade_inicial: 10.5
            };

            await expect(
                LoteService.criarLote(dados)
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'quantidade_inicial deve ser um número inteiro maior que zero'
            });
        });

        test('deve rejeitar produto inexistente', async () => {
            ProdutoRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                LoteService.criarLote(dadosValidos)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Produto informado não existe'
            });

            expect(FornecedorRepository.buscarPorId)
                .not.toHaveBeenCalled();

            expect(LoteRepository.criarComEstoque)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar fornecedor inexistente', async () => {
            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 1
                });

            FornecedorRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                LoteService.criarLote(dadosValidos)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Fornecedor informado não existe'
            });

            expect(LoteRepository.criarComEstoque)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar número de lote duplicado', async () => {
            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 1
                });

            FornecedorRepository.buscarPorId
                .mockResolvedValue({
                    id_fornecedor: 1
                });

            LoteRepository.buscarPorNumeroLote
                .mockResolvedValue({
                    id_lote: 5,
                    numero_lote: 'LOTE001'
                });

            await expect(
                LoteService.criarLote(dadosValidos)
            ).rejects.toEqual({
                status: 409,
                mensagem:
                    'Já existe um lote cadastrado com este número'
            });

            expect(LoteRepository.criarComEstoque)
                .not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // atualizarLote
    // ==========================================

    describe('atualizarLote', () => {

        test('deve atualizar lote com sucesso', async () => {
            const loteAtualizado = {
                id_lote: 1,
                numero_lote: 'LOTE002'
            };

            LoteRepository.buscarPorId
                .mockResolvedValueOnce({
                    id_lote: 1,
                    numero_lote: 'LOTE001'
                })
                .mockResolvedValueOnce(loteAtualizado);

            LoteRepository.atualizar
                .mockResolvedValue(true);

            const resultado =
                await LoteService.atualizarLote(1, {
                    numero_lote: 'LOTE002'
                });

            expect(LoteRepository.atualizar)
                .toHaveBeenCalledWith(
                    1,
                    {
                        numero_lote: 'LOTE002'
                    }
                );

            expect(resultado).toEqual({
                sucesso: true,
                mensagem: 'Lote atualizado com sucesso',
                dados: loteAtualizado
            });
        });

        test('deve rejeitar ID inválido', async () => {
            await expect(
                LoteService.atualizarLote('abc', {
                    numero_lote: 'LOTE002'
                })
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

            expect(LoteRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar lote inexistente', async () => {
            LoteRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                LoteService.atualizarLote(999, {
                    numero_lote: 'LOTE002'
                })
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Lote não encontrado'
            });

            expect(LoteRepository.atualizar)
                .not.toHaveBeenCalled();
        });

        test('deve atualizar múltiplos campos', async () => {
            const dados = {
                id_produto: 2,
                numero_lote: 'LOTE002',
                dt_fabricacao: '2026-02-01',
                dt_validade: '2027-02-01',
                quantidade_inicial: 200,
                id_fornecedor: 3
            };

            LoteRepository.buscarPorId
                .mockResolvedValueOnce({
                    id_lote: 1
                })
                .mockResolvedValueOnce({
                    id_lote: 1,
                    ...dados
                });

            LoteRepository.atualizar
                .mockResolvedValue(true);

            const resultado =
                await LoteService.atualizarLote(1, dados);

            expect(LoteRepository.atualizar)
                .toHaveBeenCalledWith(1, dados);

            expect(resultado.sucesso)
                .toBe(true);
        });

        test('deve rejeitar quando nenhum campo for informado', async () => {
            LoteRepository.buscarPorId
                .mockResolvedValue({
                    id_lote: 1
                });

            await expect(
                LoteService.atualizarLote(1, {})
            ).rejects.toEqual({
                status: 400,
                mensagem: 'Nenhum campo para atualizar'
            });

            expect(LoteRepository.atualizar)
                .not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // removerLote
    // ==========================================

    describe('removerLote', () => {

        test('deve remover lote com sucesso', async () => {
            LoteRepository.buscarPorId
                .mockResolvedValue({
                    id_lote: 1,
                    numero_lote: 'LOTE001'
                });

            LoteRepository.contarDependencias
                .mockResolvedValue(0);

            LoteRepository.remover
                .mockResolvedValue(true);

            const resultado =
                await LoteService.removerLote(1);

            expect(LoteRepository.buscarPorId)
                .toHaveBeenCalledWith(1);

            expect(LoteRepository.contarDependencias)
                .toHaveBeenCalledWith(1);

            expect(LoteRepository.remover)
                .toHaveBeenCalledWith(1);

            expect(resultado).toEqual({
                sucesso: true,
                mensagem: 'Lote removido com sucesso'
            });
        });

        test('deve rejeitar ID inválido', async () => {
            await expect(
                LoteService.removerLote('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

            expect(LoteRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar lote inexistente', async () => {
            LoteRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                LoteService.removerLote(999)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Lote não encontrado'
            });

            expect(LoteRepository.contarDependencias)
                .not.toHaveBeenCalled();

            expect(LoteRepository.remover)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar lote com dependências', async () => {
            LoteRepository.buscarPorId
                .mockResolvedValue({
                    id_lote: 1,
                    numero_lote: 'LOTE001'
                });

            LoteRepository.contarDependencias
                .mockResolvedValue(2);

            await expect(
                LoteService.removerLote(1)
            ).rejects.toEqual({
                status: 409,
                mensagem:
                    'Lote possui estoque ou movimentações vinculadas e não pode ser removido'
            });

            expect(LoteRepository.remover)
                .not.toHaveBeenCalled();
        });
    });
});