jest.mock('../../src/repositories/EstoqueRepository');
jest.mock('../../src/repositories/ProdutoRepository');
jest.mock('../../src/repositories/LoteRepository');

const EstoqueService = require('../../src/services/EstoqueService');

const EstoqueRepository = require('../../src/repositories/EstoqueRepository');
const ProdutoRepository = require('../../src/repositories/ProdutoRepository');
const LoteRepository = require('../../src/repositories/LoteRepository');

describe('EstoqueService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // listarEstoques
    // ==========================================

    describe('listarEstoques', () => {

        test('deve listar todos os estoques', async () => {

            const estoques = [
                {
                    id_estoque: 1,
                    id_produto: 1,
                    qtd_atual: '50',
                    estoque_minimo: '20'
                },
                {
                    id_estoque: 2,
                    id_produto: 2,
                    qtd_atual: '10',
                    estoque_minimo: '15'
                }
            ];

            EstoqueRepository.listarTodos
                .mockResolvedValue(estoques);

            const resultado =
                await EstoqueService.listarEstoques();

            expect(EstoqueRepository.listarTodos)
                .toHaveBeenCalled();

            expect(resultado).toEqual({
                sucesso: true,
                dados: [
                    {
                        id_estoque: 1,
                        id_produto: 1,
                        qtd_atual: 50,
                        estoque_minimo: 20
                    },
                    {
                        id_estoque: 2,
                        id_produto: 2,
                        qtd_atual: 10,
                        estoque_minimo: 15
                    }
                ],
                total: 2
            });
        });

        test('deve retornar lista vazia', async () => {

            EstoqueRepository.listarTodos
                .mockResolvedValue([]);

            const resultado =
                await EstoqueService.listarEstoques();

            expect(resultado).toEqual({
                sucesso: true,
                dados: [],
                total: 0
            });
        });
    });

    // ==========================================
    // buscarEstoquePorId
    // ==========================================

    describe('buscarEstoquePorId', () => {

        test('deve buscar estoque por ID', async () => {

            const estoque = {
                id_estoque: 1,
                qtd_atual: '30',
                estoque_minimo: '10'
            };

            EstoqueRepository.buscarPorId
                .mockResolvedValue(estoque);

            const resultado =
                await EstoqueService.buscarEstoquePorId(1);

            expect(EstoqueRepository.buscarPorId)
                .toHaveBeenCalledWith(1);

            expect(resultado).toEqual({
                sucesso: true,
                dados: {
                    id_estoque: 1,
                    qtd_atual: 30,
                    estoque_minimo: 10
                }
            });
        });

        test('deve rejeitar ID inválido', async () => {

            await expect(
                EstoqueService.buscarEstoquePorId('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

            expect(EstoqueRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar quando ID não for informado', async () => {

            await expect(
                EstoqueService.buscarEstoquePorId()
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });
        });

        test('deve rejeitar estoque inexistente', async () => {

            EstoqueRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                EstoqueService.buscarEstoquePorId(999)
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Registro de estoque não encontrado'
            });
        });
    });

    // ==========================================
    // ajustarEstoque
    // ==========================================

    describe('ajustarEstoque', () => {

        test('deve ajustar estoque com sucesso', async () => {

            const resultadoAjuste = {
                id_ajuste: 1,
                estoque: {
                    id_estoque: 5,
                    qtd_atual: 110
                }
            };

            EstoqueRepository.ajustarComAuditoria
                .mockResolvedValue(resultadoAjuste);

            const resultado =
                await EstoqueService.ajustarEstoque(
                    5,
                    {
                        diferenca: 10,
                        motivo: 'Reposição'
                    },
                    1
                );

            expect(
                EstoqueRepository.ajustarComAuditoria
            ).toHaveBeenCalledWith(
                5,
                1,
                10,
                'Reposição'
            );

            expect(resultado).toEqual({
                sucesso: true,
                mensagem:
                    'Estoque ajustado e auditado com sucesso',
                dados: resultadoAjuste
            });
        });

        test('deve rejeitar ID inválido', async () => {

            await expect(
                EstoqueService.ajustarEstoque(
                    'abc',
                    {
                        diferenca: 10,
                        motivo: 'Teste'
                    },
                    1
                )
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

            expect(
                EstoqueRepository.ajustarComAuditoria
            ).not.toHaveBeenCalled();
        });

        test('deve rejeitar diferença zero', async () => {

            await expect(
                EstoqueService.ajustarEstoque(
                    1,
                    {
                        diferenca: 0,
                        motivo: 'Teste'
                    },
                    1
                )
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'diferenca deve ser um número inteiro diferente de zero'
            });
        });

        test('deve rejeitar diferença decimal', async () => {

            await expect(
                EstoqueService.ajustarEstoque(
                    1,
                    {
                        diferenca: 10.5,
                        motivo: 'Teste'
                    },
                    1
                )
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'diferenca deve ser um número inteiro diferente de zero'
            });
        });

        test('deve rejeitar motivo vazio', async () => {

            await expect(
                EstoqueService.ajustarEstoque(
                    1,
                    {
                        diferenca: 10,
                        motivo: ''
                    },
                    1
                )
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'motivo é obrigatório e deve ter no máximo 200 caracteres'
            });
        });

        test('deve rejeitar motivo com mais de 200 caracteres', async () => {

            await expect(
                EstoqueService.ajustarEstoque(
                    1,
                    {
                        diferenca: 10,
                        motivo: 'a'.repeat(201)
                    },
                    1
                )
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'motivo é obrigatório e deve ter no máximo 200 caracteres'
            });
        });

        test('deve remover espaços do motivo', async () => {

            EstoqueRepository.ajustarComAuditoria
                .mockResolvedValue({
                    id_ajuste: 1
                });

            await EstoqueService.ajustarEstoque(
                1,
                {
                    diferenca: -5,
                    motivo: '  Correção  '
                },
                2
            );

            expect(
                EstoqueRepository.ajustarComAuditoria
            ).toHaveBeenCalledWith(
                1,
                2,
                -5,
                'Correção'
            );
        });
    });

    // ==========================================
    // criarEstoque
    // ==========================================

    describe('criarEstoque', () => {

        const dadosValidos = {
            id_produto: 1,
            id_lote: 2,
            qtd_atual: 50,
            localizacao_corredor: 'A',
            localizacao_prateleira: '01'
        };

        test('deve criar estoque com sucesso', async () => {

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 1
                });

            LoteRepository.buscarPorId
                .mockResolvedValue({
                    id_lote: 2
                });

            EstoqueRepository.criar
                .mockResolvedValue(10);

            EstoqueRepository.buscarPorId
                .mockResolvedValue({
                    id_estoque: 10,
                    id_produto: 1,
                    id_lote: 2,
                    qtd_atual: '50',
                    estoque_minimo: '10',
                    localizacao_corredor: 'A',
                    localizacao_prateleira: '01'
                });

            const resultado =
                await EstoqueService.criarEstoque(
                    dadosValidos
                );

            expect(EstoqueRepository.criar)
                .toHaveBeenCalledWith(dadosValidos);

            expect(resultado).toEqual({
                sucesso: true,
                mensagem:
                    'Registro de estoque criado com sucesso',
                dados: {
                    id_estoque: 10,
                    id_produto: 1,
                    id_lote: 2,
                    qtd_atual: 50,
                    estoque_minimo: 10,
                    localizacao_corredor: 'A',
                    localizacao_prateleira: '01'
                }
            });
        });

        test('deve rejeitar campos obrigatórios faltando', async () => {

            await expect(
                EstoqueService.criarEstoque({
                    id_produto: 1
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Campos obrigatórios faltando: id_produto, id_lote, qtd_atual, localizacao_corredor, localizacao_prateleira'
            });

            expect(ProdutoRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar quantidade zero', async () => {

            await expect(
                EstoqueService.criarEstoque({
                    ...dadosValidos,
                    qtd_atual: 0
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'A quantidade atual deve ser maior que zero'
            });
        });

        test('deve rejeitar quantidade negativa', async () => {

            await expect(
                EstoqueService.criarEstoque({
                    ...dadosValidos,
                    qtd_atual: -5
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'A quantidade atual deve ser maior que zero'
            });
        });

        test('deve rejeitar produto inexistente', async () => {

            ProdutoRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                EstoqueService.criarEstoque(
                    dadosValidos
                )
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Produto informado não existe'
            });

            expect(LoteRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar lote inexistente', async () => {

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 1
                });

            LoteRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                EstoqueService.criarEstoque(
                    dadosValidos
                )
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Lote informado não existe'
            });

            expect(EstoqueRepository.criar)
                .not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // atualizarEstoque
    // ==========================================

    describe('atualizarEstoque', () => {

        test('deve atualizar localização com sucesso', async () => {

            const estoque = {
                id_estoque: 1,
                qtd_atual: 50
            };

            EstoqueRepository.buscarPorId
                .mockResolvedValueOnce(estoque)
                .mockResolvedValueOnce({
                    ...estoque,
                    localizacao_corredor: 'B'
                });

            EstoqueRepository.atualizar
                .mockResolvedValue(true);

            const resultado =
                await EstoqueService.atualizarEstoque(
                    1,
                    {
                        localizacao_corredor: 'B'
                    }
                );

            expect(EstoqueRepository.atualizar)
                .toHaveBeenCalledWith(
                    1,
                    {
                        localizacao_corredor: 'B'
                    }
                );

            expect(resultado.sucesso)
                .toBe(true);
        });

        test('deve rejeitar ID inválido', async () => {

            await expect(
                EstoqueService.atualizarEstoque(
                    'abc',
                    {}
                )
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });
        });

        test('deve rejeitar estoque inexistente', async () => {

            EstoqueRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                EstoqueService.atualizarEstoque(
                    999,
                    {
                        localizacao_corredor: 'B'
                    }
                )
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Registro de estoque não encontrado'
            });
        });

        test('não deve permitir alteração direta da quantidade', async () => {

            EstoqueRepository.buscarPorId
                .mockResolvedValue({
                    id_estoque: 1,
                    qtd_atual: 50
                });

            await expect(
                EstoqueService.atualizarEstoque(
                    1,
                    {
                        qtd_atual: 100
                    }
                )
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'qtd_atual só pode ser alterada pelo endpoint de ajuste auditável'
            });

            expect(EstoqueRepository.atualizar)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar quando nenhum campo for informado', async () => {

            EstoqueRepository.buscarPorId
                .mockResolvedValue({
                    id_estoque: 1
                });

            await expect(
                EstoqueService.atualizarEstoque(
                    1,
                    {}
                )
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Nenhum campo para atualizar'
            });
        });
    });

    // ==========================================
    // removerEstoque
    // ==========================================

    describe('removerEstoque', () => {

        test('deve remover estoque vazio', async () => {

            EstoqueRepository.buscarPorId
                .mockResolvedValue({
                    id_estoque: 1,
                    qtd_atual: 0
                });

            EstoqueRepository.remover
                .mockResolvedValue(true);

            const resultado =
                await EstoqueService.removerEstoque(1);

            expect(EstoqueRepository.remover)
                .toHaveBeenCalledWith(1);

            expect(resultado).toEqual({
                sucesso: true,
                mensagem:
                    'Registro de estoque removido com sucesso'
            });
        });

        test('deve rejeitar ID inválido', async () => {

            await expect(
                EstoqueService.removerEstoque('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

            expect(EstoqueRepository.buscarPorId)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar estoque inexistente', async () => {

            EstoqueRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                EstoqueService.removerEstoque(999)
            ).rejects.toEqual({
                status: 404,
                mensagem:
                    'Registro de estoque não encontrado'
            });

            expect(EstoqueRepository.remover)
                .not.toHaveBeenCalled();
        });

        test('deve rejeitar estoque com saldo positivo', async () => {

            EstoqueRepository.buscarPorId
                .mockResolvedValue({
                    id_estoque: 1,
                    qtd_atual: 10
                });

            await expect(
                EstoqueService.removerEstoque(1)
            ).rejects.toEqual({
                status: 409,
                mensagem:
                    'Estoque com saldo positivo não pode ser removido'
            });

            expect(EstoqueRepository.remover)
                .not.toHaveBeenCalled();
        });
    });
});