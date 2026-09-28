jest.mock('../../src/repositories/EntradaRepository');
jest.mock('../../src/repositories/UsuarioRepository');
jest.mock('../../src/repositories/FornecedorRepository');
jest.mock('../../src/repositories/ProdutoRepository');
jest.mock('../../src/repositories/EstoqueRepository');

const EntradaService = require('../../src/services/EntradaService');

const EntradaRepository = require('../../src/repositories/EntradaRepository');
const UsuarioRepository = require('../../src/repositories/UsuarioRepository');
const FornecedorRepository = require('../../src/repositories/FornecedorRepository');
const ProdutoRepository = require('../../src/repositories/ProdutoRepository');
const EstoqueRepository = require('../../src/repositories/EstoqueRepository');

describe('EntradaService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // listarEntradas
    // ==========================================

    describe('listarEntradas', () => {

        test('deve listar todas as entradas', async () => {
            const entradas = [
                {
                    id_entrada: 1,
                    quantidade: 10
                },
                {
                    id_entrada: 2,
                    quantidade: 20
                }
            ];

            EntradaRepository.listarTodos
                .mockResolvedValue(entradas);

            const resultado =
                await EntradaService.listarEntradas();

            expect(EntradaRepository.listarTodos)
                .toHaveBeenCalled();

            expect(resultado).toEqual({
                sucesso: true,
                dados: entradas,
                total: 2
            });
        });

        test('deve retornar lista vazia quando não houver entradas', async () => {
            EntradaRepository.listarTodos
                .mockResolvedValue([]);

            const resultado =
                await EntradaService.listarEntradas();

            expect(resultado).toEqual({
                sucesso: true,
                dados: [],
                total: 0
            });
        });
    });

    // ==========================================
    // buscarEntradaPorId
    // ==========================================

    describe('buscarEntradaPorId', () => {

        test('deve buscar entrada por ID', async () => {
            const entrada = {
                id_entrada: 1,
                quantidade: 10
            };

            EntradaRepository.buscarPorId
                .mockResolvedValue(entrada);

            const resultado =
                await EntradaService.buscarEntradaPorId(1);

            expect(EntradaRepository.buscarPorId)
                .toHaveBeenCalledWith(1);

            expect(resultado).toEqual({
                sucesso: true,
                dados: entrada
            });
        });

        test('deve rejeitar ID inválido', async () => {
            await expect(
                EntradaService.buscarEntradaPorId('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

            expect(EntradaRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar quando ID não for informado', async () => {
            await expect(
                EntradaService.buscarEntradaPorId()
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });
        });

        test('deve rejeitar entrada inexistente', async () => {
            EntradaRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                EntradaService.buscarEntradaPorId(999)
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Movimentação de entrada não encontrada'
            });
        });
    });

    // ==========================================
    // criarEntrada
    // ==========================================

    describe('criarEntrada', () => {

        const dadosValidos = {
            id_usuario: 1,
            id_fornecedor: 2,
            id_produto: 3,
            data: '2026-09-28',
            lote: 'LOTE001',
            quantidade: 10,
            rastreamento: 'ABC123'
        };

        test('deve criar entrada com sucesso', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1
                });

            FornecedorRepository.buscarPorId
                .mockResolvedValue({
                    id_fornecedor: 2
                });

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 3
                });

            EstoqueRepository.buscarPorProdutoELote
                .mockResolvedValue({
                    id_estoque: 5,
                    id_produto: 3
                });

            EntradaRepository.criar
                .mockResolvedValue(10);

            EntradaRepository.buscarPorId
                .mockResolvedValue({
                    id_entrada: 10,
                    ...dadosValidos
                });

            EstoqueRepository.alterarQuantidade
                .mockResolvedValue(true);

            const resultado =
                await EntradaService.criarEntrada(dadosValidos);

            expect(EntradaRepository.criar)
                .toHaveBeenCalledWith({
                    id_usuario: 1,
                    id_fornecedor: 2,
                    id_produto: 3,
                    data: '2026-09-28',
                    lote: 'LOTE001',
                    quantidade: 10,
                    rastreamento: 'ABC123'
                });

            expect(EstoqueRepository.alterarQuantidade)
                .toHaveBeenCalledWith(5, 10);

            expect(resultado.sucesso)
                .toBe(true);

            expect(resultado.mensagem)
                .toBe(
                    'Movimentação de entrada cadastrada com sucesso'
                );
        });

        test('deve aceitar rastreamento não informado', async () => {

            const dados = {
                ...dadosValidos
            };

            delete dados.rastreamento;

            UsuarioRepository.buscarPorId
                .mockResolvedValue({ id_usuario: 1 });

            FornecedorRepository.buscarPorId
                .mockResolvedValue({ id_fornecedor: 2 });

            ProdutoRepository.buscarPorId
                .mockResolvedValue({ id_produto: 3 });

            EstoqueRepository.buscarPorProdutoELote
                .mockResolvedValue({ id_estoque: 5 });

            EntradaRepository.criar
                .mockResolvedValue(10);

            EntradaRepository.buscarPorId
                .mockResolvedValue({
                    id_entrada: 10
                });

            await EntradaService.criarEntrada(dados);

            expect(EntradaRepository.criar)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        rastreamento: null
                    })
                );
        });

        test('deve rejeitar campos obrigatórios faltando', async () => {

            await expect(
                EntradaService.criarEntrada({
                    id_usuario: 1
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Campos obrigatórios faltando: id_usuario, id_fornecedor, id_produto, data, lote, quantidade'
            });

            expect(UsuarioRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar quantidade zero', async () => {

            const dados = {
                ...dadosValidos,
                quantidade: 0
            };

            await expect(
                EntradaService.criarEntrada(dados)
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'A quantidade deve ser um número inteiro maior que zero'
            });
        });

        test('deve rejeitar quantidade negativa', async () => {

            const dados = {
                ...dadosValidos,
                quantidade: -5
            };

            await expect(
                EntradaService.criarEntrada(dados)
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'A quantidade deve ser um número inteiro maior que zero'
            });
        });

        test('deve rejeitar quantidade decimal', async () => {

            const dados = {
                ...dadosValidos,
                quantidade: 10.5
            };

            await expect(
                EntradaService.criarEntrada(dados)
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'A quantidade deve ser um número inteiro maior que zero'
            });
        });

        test('deve rejeitar quantidade que não seja número', async () => {

            const dados = {
                ...dadosValidos,
                quantidade: '10'
            };

            await expect(
                EntradaService.criarEntrada(dados)
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'A quantidade deve ser um número inteiro maior que zero'
            });
        });

        test('deve rejeitar usuário inexistente', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                EntradaService.criarEntrada(dadosValidos)
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Usuário informado não existe'
            });

            expect(FornecedorRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar fornecedor inexistente', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1
                });

            FornecedorRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                EntradaService.criarEntrada(dadosValidos)
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Fornecedor informado não existe'
            });

            expect(ProdutoRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar produto inexistente', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1
                });

            FornecedorRepository.buscarPorId
                .mockResolvedValue({
                    id_fornecedor: 2
                });

            ProdutoRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                EntradaService.criarEntrada(dadosValidos)
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Produto informado não existe'
            });

            expect(EstoqueRepository.buscarPorProdutoELote)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar quando estoque não existir', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1
                });

            FornecedorRepository.buscarPorId
                .mockResolvedValue({
                    id_fornecedor: 2
                });

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 3
                });

            EstoqueRepository.buscarPorProdutoELote
                .mockResolvedValue(null);

            await expect(
                EntradaService.criarEntrada(dadosValidos)
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Estoque não encontrado para o produto e lote informados'
            });

            expect(EntradaRepository.criar)
                .not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // atualizarEntrada
    // ==========================================

    describe('atualizarEntrada', () => {

        test('deve rejeitar ID inválido', async () => {

            await expect(
                EntradaService.atualizarEntrada('abc', {})
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });
        });

        test('deve rejeitar entrada inexistente', async () => {

            EntradaRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                EntradaService.atualizarEntrada(999, {})
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Movimentação de entrada não encontrada'
            });
        });

        test('deve rejeitar quando nenhum campo for informado', async () => {

            EntradaRepository.buscarPorId
                .mockResolvedValue({
                    id_entrada: 1,
                    id_produto: 3,
                    lote: 'LOTE001',
                    quantidade: 10
                });

            await expect(
                EntradaService.atualizarEntrada(1, {})
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Nenhum campo para atualizar'
            });
        });

        test('deve atualizar dados simples da entrada', async () => {

            const entrada = {
                id_entrada: 1,
                id_usuario: 1,
                id_fornecedor: 2,
                id_produto: 3,
                lote: 'LOTE001',
                quantidade: 10
            };

            EntradaRepository.buscarPorId
                .mockResolvedValue(entrada);

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1
                });

            EntradaRepository.atualizar
                .mockResolvedValue(true);

            EntradaRepository.buscarPorId
                .mockResolvedValueOnce(entrada)
                .mockResolvedValueOnce({
                    ...entrada,
                    data: '2026-09-29'
                });

            EstoqueRepository.buscarPorProdutoELote
                .mockResolvedValue({
                    id_estoque: 5
                });

            const resultado =
                await EntradaService.atualizarEntrada(1, {
                    data: '2026-09-29'
                });

            expect(EntradaRepository.atualizar)
                .toHaveBeenCalledWith(
                    1,
                    {
                        data: '2026-09-29'
                    }
                );

            expect(resultado.sucesso)
                .toBe(true);
        });

        test('deve rejeitar quantidade inválida na atualização', async () => {

            EntradaRepository.buscarPorId
                .mockResolvedValue({
                    id_entrada: 1,
                    id_produto: 3,
                    lote: 'LOTE001',
                    quantidade: 10
                });

            await expect(
                EntradaService.atualizarEntrada(1, {
                    quantidade: 0
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'A quantidade deve ser um número inteiro maior que zero'
            });
        });

        test('deve rejeitar usuário inexistente na atualização', async () => {

            EntradaRepository.buscarPorId
                .mockResolvedValue({
                    id_entrada: 1
                });

            UsuarioRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                EntradaService.atualizarEntrada(1, {
                    id_usuario: 999
                })
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Usuário informado não existe'
            });
        });

        test('deve rejeitar fornecedor inexistente na atualização', async () => {

            EntradaRepository.buscarPorId
                .mockResolvedValue({
                    id_entrada: 1
                });

            FornecedorRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                EntradaService.atualizarEntrada(1, {
                    id_fornecedor: 999
                })
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Fornecedor informado não existe'
            });
        });

        test('deve rejeitar produto inexistente na atualização', async () => {

            EntradaRepository.buscarPorId
                .mockResolvedValue({
                    id_entrada: 1
                });

            ProdutoRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                EntradaService.atualizarEntrada(1, {
                    id_produto: 999
                })
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Produto informado não existe'
            });
        });

        test('deve atualizar quantidade e ajustar estoque', async () => {

            const entrada = {
                id_entrada: 1,
                id_produto: 3,
                lote: 'LOTE001',
                quantidade: 10
            };

            EntradaRepository.buscarPorId
                .mockResolvedValueOnce(entrada)
                .mockResolvedValueOnce({
                    ...entrada,
                    quantidade: 15
                });

            EstoqueRepository.buscarPorProdutoELote
                .mockResolvedValue({
                    id_estoque: 5
                });

            EstoqueRepository.alterarQuantidade
                .mockResolvedValue(true);

            EntradaRepository.atualizar
                .mockResolvedValue(true);

            const resultado =
                await EntradaService.atualizarEntrada(1, {
                    quantidade: 15
                });

            expect(EstoqueRepository.alterarQuantidade)
                .toHaveBeenCalledWith(5, 5);

            expect(EntradaRepository.atualizar)
                .toHaveBeenCalledWith(
                    1,
                    {
                        quantidade: 15
                    }
                );

            expect(resultado.sucesso)
                .toBe(true);
        });

        test('deve rejeitar estoque antigo inexistente', async () => {

            EntradaRepository.buscarPorId
                .mockResolvedValue({
                    id_entrada: 1,
                    id_produto: 3,
                    lote: 'LOTE001',
                    quantidade: 10
                });

            EstoqueRepository.buscarPorProdutoELote
                .mockResolvedValue(null);

            await expect(
                EntradaService.atualizarEntrada(1, {
                    quantidade: 15
                })
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Estoque antigo não encontrado'
            });
        });

        test('deve mover quantidade entre estoques quando produto ou lote mudar', async () => {

            const entrada = {
                id_entrada: 1,
                id_produto: 3,
                lote: 'LOTE001',
                quantidade: 10
            };

            EntradaRepository.buscarPorId
                .mockResolvedValueOnce(entrada)
                .mockResolvedValueOnce({
                    ...entrada,
                    id_produto: 4,
                    lote: 'LOTE002'
                });

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 4
                });

            EstoqueRepository.buscarPorProdutoELote
                .mockResolvedValueOnce({
                    id_estoque: 5
                })
                .mockResolvedValueOnce({
                    id_estoque: 6
                });

            EstoqueRepository.alterarQuantidade
                .mockResolvedValue(true);

            EntradaRepository.atualizar
                .mockResolvedValue(true);

            await EntradaService.atualizarEntrada(1, {
                id_produto: 4,
                lote: 'LOTE002'
            });

            expect(EstoqueRepository.alterarQuantidade)
                .toHaveBeenNthCalledWith(1, 5, -10);

            expect(EstoqueRepository.alterarQuantidade)
                .toHaveBeenNthCalledWith(2, 6, 10);
        });

        test('deve rejeitar estoque novo inexistente ao trocar produto ou lote', async () => {

            const entrada = {
                id_entrada: 1,
                id_produto: 3,
                lote: 'LOTE001',
                quantidade: 10
            };

            EntradaRepository.buscarPorId
                .mockResolvedValueOnce(entrada);

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 4
                });

            EstoqueRepository.buscarPorProdutoELote
                .mockResolvedValueOnce({
                    id_estoque: 5
                })
                .mockResolvedValueOnce(null);

            await expect(
                EntradaService.atualizarEntrada(1, {
                    id_produto: 4
                })
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Estoque novo não encontrado para o produto e lote informados'
            });

            expect(EstoqueRepository.alterarQuantidade)
                .not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // removerEntrada
    // ==========================================

    describe('removerEntrada', () => {

        test('deve remover entrada com sucesso', async () => {

            EntradaRepository.buscarPorId
                .mockResolvedValue({
                    id_entrada: 1
                });

            EntradaRepository.remover
                .mockResolvedValue(true);

            const resultado =
                await EntradaService.removerEntrada(1);

            expect(EntradaRepository.buscarPorId)
                .toHaveBeenCalledWith(1);

            expect(EntradaRepository.remover)
                .toHaveBeenCalledWith(1);

            expect(resultado).toEqual({
                sucesso: true,
                mensagem:
                    'Movimentação de entrada removida com sucesso'
            });
        });

        test('deve rejeitar ID inválido', async () => {

            await expect(
                EntradaService.removerEntrada('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

            expect(EntradaRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar entrada inexistente', async () => {

            EntradaRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                EntradaService.removerEntrada(999)
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Movimentação de entrada não encontrada'
            });

            expect(EntradaRepository.remover)
                .not.toHaveBeenCalled();
        });
    });
});
