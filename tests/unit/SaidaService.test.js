jest.mock('../../src/repositories/SaidaRepository');
jest.mock('../../src/repositories/UsuarioRepository');
jest.mock('../../src/repositories/ProdutoRepository');
jest.mock('../../src/repositories/EstoqueRepository');
jest.mock('../../src/repositories/LoteRepository');

const SaidaService = require('../../src/services/SaidaService');

const SaidaRepository = require('../../src/repositories/SaidaRepository');
const UsuarioRepository = require('../../src/repositories/UsuarioRepository');
const ProdutoRepository = require('../../src/repositories/ProdutoRepository');
const EstoqueRepository = require('../../src/repositories/EstoqueRepository');
const LoteRepository = require('../../src/repositories/LoteRepository');

describe('SaidaService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // listarSaidas
    // ==========================================

    describe('listarSaidas', () => {

        test('deve listar todas as saídas', async () => {
            const saidas = [
                {
                    id_saida: 1,
                    quantidade: 10
                },
                {
                    id_saida: 2,
                    quantidade: 20
                }
            ];

            SaidaRepository.listarTodos
                .mockResolvedValue(saidas);

            const resultado =
                await SaidaService.listarSaidas();

            expect(SaidaRepository.listarTodos)
                .toHaveBeenCalled();

            expect(resultado).toEqual({
                sucesso: true,
                dados: saidas,
                total: 2
            });
        });

        test('deve retornar lista vazia quando não houver saídas', async () => {
            SaidaRepository.listarTodos
                .mockResolvedValue([]);

            const resultado =
                await SaidaService.listarSaidas();

            expect(resultado).toEqual({
                sucesso: true,
                dados: [],
                total: 0
            });
        });

        test('deve listar saídas com filtros e paginação', async () => {
            const saidas = [
                {
                    id_saida: 1,
                    id_produto: 3,
                    nome_produto: 'Mouse',
                    numero_lote: 'L002',
                    nome_usuario: 'Vendedor',
                    quantidade: 5
                }
            ];
            saidas.total = 10;

            SaidaRepository.listarTodos
                .mockResolvedValue(saidas);

            const filtros = { page: 2, limit: 5, id_produto: 3 };
            const resultado =
                await SaidaService.listarSaidas(filtros);

            expect(SaidaRepository.listarTodos)
                .toHaveBeenCalledWith(filtros);

            expect(resultado).toEqual({
                sucesso: true,
                dados: saidas,
                total: 10,
                pagina: 2,
                limite: 5,
                total_paginas: 2
            });
        });
    });

    // ==========================================
    // buscarSaidaPorId
    // ==========================================

    describe('buscarSaidaPorId', () => {

        test('deve buscar saída por ID', async () => {
            const saida = {
                id_saida: 1,
                quantidade: 10
            };

            SaidaRepository.buscarPorId
                .mockResolvedValue(saida);

            const resultado =
                await SaidaService.buscarSaidaPorId(1);

            expect(SaidaRepository.buscarPorId)
                .toHaveBeenCalledWith(1);

            expect(resultado).toEqual({
                sucesso: true,
                dados: saida
            });
        });

        test('deve rejeitar ID inválido', async () => {

            await expect(
                SaidaService.buscarSaidaPorId('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

            expect(SaidaRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar quando ID não for informado', async () => {

            await expect(
                SaidaService.buscarSaidaPorId()
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });
        });

        test('deve rejeitar saída inexistente', async () => {

            SaidaRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                SaidaService.buscarSaidaPorId(999)
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Movimentação de saída não encontrada'
            });
        });
    });

    // ==========================================
    // criarSaida
    // ==========================================

    describe('criarSaida', () => {

        const dadosValidos = {
            id_usuario: 1,
            id_produto: 3,
            data: '2026-09-28',
            id_lote: 1,
            quantidade: 10,
            motivo: 'venda',
            rastreamento: 'ABC123'
        };

        test('deve criar saída com sucesso', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1
                });

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 3
                });

            LoteRepository.buscarPorId
                .mockResolvedValue({
                    id_lote: 1,
                    id_produto: 3
                });

            EstoqueRepository.buscarPorLote
                .mockResolvedValue({
                    id_estoque: 1,
                    qtd_atual: 20
                });

            EstoqueRepository.alterarQuantidade
                .mockResolvedValue(true);

            SaidaRepository.criar
                .mockResolvedValue(10);

            SaidaRepository.buscarPorId
                .mockResolvedValue({
                    id_saida: 10,
                    ...dadosValidos
                });

            const resultado =
                await SaidaService.criarSaida(dadosValidos);

            expect(SaidaRepository.criar)
                .toHaveBeenCalledWith({
                    id_usuario: 1,
                    id_produto: 3,
                    data: '2026-09-28',
                    id_lote: 1,
                    quantidade: 10,
                    motivo: 'venda',
                    rastreamento: 'ABC123'
                });

            expect(resultado).toEqual({
                sucesso: true,
                mensagem:
                    'Movimentação de saída cadastrada com sucesso',
                dados: {
                    id_saida: 10,
                    ...dadosValidos
                }
            });
        });

        test('deve aceitar saída sem rastreamento nem motivo', async () => {

            const dados = {
                id_usuario: 1,
                id_produto: 3,
                data: '2026-09-28',
                id_lote: 1,
                quantidade: 10
            };

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1
                });

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 3
                });

            LoteRepository.buscarPorId
                .mockResolvedValue({
                    id_lote: 1,
                    id_produto: 3
                });

            EstoqueRepository.buscarPorLote
                .mockResolvedValue({
                    id_estoque: 1,
                    qtd_atual: 20
                });

            EstoqueRepository.alterarQuantidade
                .mockResolvedValue(true);

            SaidaRepository.criar
                .mockResolvedValue(10);

            SaidaRepository.buscarPorId
                .mockResolvedValue({
                    id_saida: 10,
                    ...dados,
                    motivo: null,
                    rastreamento: null
                });

            await SaidaService.criarSaida(dados);

            expect(SaidaRepository.criar)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        motivo: null,
                        rastreamento: null
                    })
                );
        });

        test('deve rejeitar campos obrigatórios faltando', async () => {

            await expect(
                SaidaService.criarSaida({
                    id_usuario: 1
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Campos obrigatórios faltando: id_produto, data, id_lote, quantidade'
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
                SaidaService.criarSaida(dados)
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'A quantidade deve ser maior que zero'
            });
        });

        test('deve rejeitar quantidade negativa', async () => {

            const dados = {
                ...dadosValidos,
                quantidade: -5
            };

            await expect(
                SaidaService.criarSaida(dados)
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'A quantidade deve ser maior que zero'
            });
        });

        test('deve rejeitar usuário inexistente', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                SaidaService.criarSaida(dadosValidos)
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Usuário informado não existe'
            });
        });

        test('deve rejeitar produto inexistente', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1
                });

            ProdutoRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                SaidaService.criarSaida(dadosValidos)
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Produto informado não existe'
            });

            expect(SaidaRepository.criar)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar lote inexistente', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1
                });

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 3
                });

            LoteRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                SaidaService.criarSaida(dadosValidos)
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Lote informado não existe'
            });
        });

        test('deve rejeitar lote que não pertence ao produto', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1
                });

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 3
                });

            LoteRepository.buscarPorId
                .mockResolvedValue({
                    id_lote: 1,
                    id_produto: 99
                });

            await expect(
                SaidaService.criarSaida(dadosValidos)
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'O lote informado não pertence ao produto informado'
            });
        });

        test('deve rejeitar estoque insuficiente', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1
                });

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 3
                });

            LoteRepository.buscarPorId
                .mockResolvedValue({
                    id_lote: 1,
                    id_produto: 3
                });

            EstoqueRepository.buscarPorLote
                .mockResolvedValue({
                    id_estoque: 1,
                    qtd_atual: 5
                });

            await expect(
                SaidaService.criarSaida(dadosValidos)
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Estoque insuficiente. Disponível: 5, solicitado: 10'
            });
        });

        test('deve rejeitar saída quando lote estiver vencido', async () => {

            UsuarioRepository.buscarPorId
                .mockResolvedValue({
                    id_usuario: 1
                });

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 3
                });

            LoteRepository.buscarPorId
                .mockResolvedValue({
                    id_lote: 1,
                    id_produto: 3,
                    dt_validade: '2020-01-01'
                });

            await expect(
                SaidaService.criarSaida(dadosValidos)
            ).rejects.toEqual({
                status: 400,
                mensagem: 'Não é permitido registrar saída de lote vencido'
            });

            expect(SaidaRepository.criar)
                .not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // atualizarSaida
    // ==========================================

    describe('atualizarSaida', () => {

        test('deve rejeitar ID inválido', async () => {

            await expect(
                SaidaService.atualizarSaida('abc', {})
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });
        });

        test('deve rejeitar saída inexistente', async () => {

            SaidaRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                SaidaService.atualizarSaida(999, {})
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Movimentação de saída não encontrada'
            });
        });

        test('deve rejeitar quando nenhum campo for informado', async () => {

            SaidaRepository.buscarPorId
                .mockResolvedValue({
                    id_saida: 1
                });

            await expect(
                SaidaService.atualizarSaida(1, {})
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Nenhum campo para atualizar'
            });

            expect(SaidaRepository.atualizar)
                .not.toHaveBeenCalled();
        });

        test('deve atualizar dados simples (motivo e data)', async () => {

            const saida = {
                id_saida: 1,
                id_usuario: 1,
                id_produto: 3,
                id_lote: 1,
                quantidade: 10,
                motivo: 'venda'
            };

            SaidaRepository.buscarPorId
                .mockResolvedValueOnce(saida)
                .mockResolvedValueOnce({
                    ...saida,
                    motivo: 'perda',
                    data: '2026-09-29'
                });

            SaidaRepository.atualizar
                .mockResolvedValue(true);

            const resultado =
                await SaidaService.atualizarSaida(1, {
                    motivo: 'perda',
                    data: '2026-09-29'
                });

            expect(SaidaRepository.atualizar)
                .toHaveBeenCalledWith(
                    1,
                    {
                        motivo: 'perda',
                        data: '2026-09-29'
                    }
                );

            expect(resultado.sucesso)
                .toBe(true);
        });

        test('deve rejeitar alteração de usuário', async () => {

            SaidaRepository.buscarPorId
                .mockResolvedValue({
                    id_saida: 1
                });

            await expect(
                SaidaService.atualizarSaida(1, {
                    id_usuario: 999
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Não é permitido alterar o usuário de uma movimentação'
            });
        });

        test('deve rejeitar produto inexistente', async () => {

            SaidaRepository.buscarPorId
                .mockResolvedValue({
                    id_saida: 1
                });

            ProdutoRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                SaidaService.atualizarSaida(1, {
                    id_produto: 999
                })
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Produto informado não existe'
            });
        });

        test('deve rejeitar quantidade inválida', async () => {

            SaidaRepository.buscarPorId
                .mockResolvedValue({
                    id_saida: 1
                });

            await expect(
                SaidaService.atualizarSaida(1, {
                    quantidade: 0
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'A quantidade deve ser maior que zero'
            });
        });

        test('deve atualizar quantidade e ajustar estoque', async () => {

            const saida = {
                id_saida: 1,
                id_lote: 1,
                quantidade: 10
            };

            SaidaRepository.buscarPorId
                .mockResolvedValueOnce(saida)
                .mockResolvedValueOnce({
                    ...saida,
                    quantidade: 20
                });

            EstoqueRepository.buscarPorLote
                .mockResolvedValue({
                    id_estoque: 1,
                    qtd_atual: 50
                });

            EstoqueRepository.alterarQuantidade
                .mockResolvedValue(true);

            SaidaRepository.atualizar
                .mockResolvedValue(true);

            const resultado =
                await SaidaService.atualizarSaida(1, {
                    quantidade: 20
                });

            expect(SaidaRepository.atualizar)
                .toHaveBeenCalledWith(
                    1,
                    {
                        quantidade: 20
                    }
                );

            expect(resultado.sucesso)
                .toBe(true);
        });
    });

    // ==========================================
    // removerSaida
    // ==========================================

    describe('removerSaida', () => {

        test('deve remover saída com sucesso', async () => {

            SaidaRepository.buscarPorId
                .mockResolvedValue({
                    id_saida: 1
                });

            SaidaRepository.remover
                .mockResolvedValue(true);

            const resultado =
                await SaidaService.removerSaida(1);

            expect(SaidaRepository.buscarPorId)
                .toHaveBeenCalledWith(1);

            expect(SaidaRepository.remover)
                .toHaveBeenCalledWith(1);

            expect(resultado).toEqual({
                sucesso: true,
                mensagem:
                    'Movimentação de saída removida com sucesso'
            });
        });

        test('deve rejeitar ID inválido', async () => {

            await expect(
                SaidaService.removerSaida('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

            expect(SaidaRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar saída inexistente', async () => {

            SaidaRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                SaidaService.removerSaida(999)
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Movimentação de saída não encontrada'
            });

            expect(SaidaRepository.remover)
                .not.toHaveBeenCalled();
        });
    });
});