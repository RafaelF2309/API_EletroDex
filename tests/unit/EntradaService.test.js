jest.mock('../../src/repositories/EntradaRepository');
jest.mock('../../src/repositories/UsuarioRepository');
jest.mock('../../src/repositories/FornecedorRepository');
jest.mock('../../src/repositories/ProdutoRepository');
jest.mock('../../src/repositories/EstoqueRepository');
jest.mock('../../src/repositories/LoteRepository');

const EntradaService = require('../../src/services/EntradaService');

const EntradaRepository = require('../../src/repositories/EntradaRepository');
const UsuarioRepository = require('../../src/repositories/UsuarioRepository');
const FornecedorRepository = require('../../src/repositories/FornecedorRepository');
const ProdutoRepository = require('../../src/repositories/ProdutoRepository');
const EstoqueRepository = require('../../src/repositories/EstoqueRepository');
const LoteRepository = require('../../src/repositories/LoteRepository');

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
                { id_entrada: 1, quantidade: 10 },
                { id_entrada: 2, quantidade: 20 }
            ];

            EntradaRepository.listarTodos.mockResolvedValue(entradas);

            const resultado = await EntradaService.listarEntradas();

            expect(EntradaRepository.listarTodos).toHaveBeenCalled();
            expect(resultado).toEqual({
                sucesso: true,
                dados: entradas,
                total: 2
            });
        });

        test('deve retornar lista vazia', async () => {
            EntradaRepository.listarTodos.mockResolvedValue([]);

            const resultado = await EntradaService.listarEntradas();

            expect(resultado).toEqual({
                sucesso: true,
                dados: [],
                total: 0
            });
        });

        test('deve retornar metadados de paginação quando page/limit informado', async () => {
            const entradas = [{ id_entrada: 1, quantidade: 10 }];
            entradas.total = 15;
            EntradaRepository.listarTodos.mockResolvedValue(entradas);

            const resultado = await EntradaService.listarEntradas({ page: 2, limit: 5 });

            expect(resultado.pagina).toBe(2);
            expect(resultado.limite).toBe(5);
            expect(resultado.total).toBe(15);
            expect(resultado.total_paginas).toBe(3);
        });
    });

    // ==========================================
    // buscarEntradaPorId
    // ==========================================

    describe('buscarEntradaPorId', () => {

        test('deve buscar entrada por ID', async () => {
            const entrada = { id_entrada: 1, quantidade: 10 };
            EntradaRepository.buscarPorId.mockResolvedValue(entrada);

            const resultado = await EntradaService.buscarEntradaPorId(1);

            expect(EntradaRepository.buscarPorId).toHaveBeenCalledWith(1);
            expect(resultado).toEqual({ sucesso: true, dados: entrada });
        });

        test('deve rejeitar ID inválido', async () => {
            await expect(
                EntradaService.buscarEntradaPorId('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

            expect(EntradaRepository.buscarPorId).not.toHaveBeenCalled();
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
            EntradaRepository.buscarPorId.mockResolvedValue(null);

            await expect(
                EntradaService.buscarEntradaPorId(999)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Movimentação de entrada não encontrada'
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
            id_lote: 7,
            quantidade: 10,
            rastreamento: 'ABC123'
        };

        beforeEach(() => {
            // Mocks padrão para fluxo feliz
            UsuarioRepository.buscarPorId.mockResolvedValue({ id_usuario: 1 });
            FornecedorRepository.buscarPorId.mockResolvedValue({ id_fornecedor: 2 });
            ProdutoRepository.buscarPorId.mockResolvedValue({ id_produto: 3 });
            LoteRepository.buscarPorId.mockResolvedValue({ id_lote: 7, id_produto: 3, dt_validade: '2099-12-31' });
            EstoqueRepository.buscarPorLote.mockResolvedValue({ id_estoque: 5, qtd_atual: 50 });
            EstoqueRepository.alterarQuantidade.mockResolvedValue(true);
            EntradaRepository.criar.mockResolvedValue(10);
            EntradaRepository.buscarPorId.mockResolvedValue({ id_entrada: 10, ...dadosValidos });
        });

        test('deve criar entrada com sucesso', async () => {
            const resultado = await EntradaService.criarEntrada(dadosValidos);

            expect(EntradaRepository.criar).toHaveBeenCalledWith({
                id_usuario: 1,
                id_fornecedor: 2,
                id_produto: 3,
                data: '2026-09-28',
                id_lote: 7,
                quantidade: 10,
                rastreamento: 'ABC123'
            });

            expect(EstoqueRepository.alterarQuantidade).toHaveBeenCalledWith(5, 10);
            expect(resultado.sucesso).toBe(true);
            expect(resultado.mensagem).toBe('Movimentação de entrada cadastrada com sucesso');
        });

        test('deve aceitar rastreamento não informado (null)', async () => {
            const dados = { ...dadosValidos };
            delete dados.rastreamento;

            await EntradaService.criarEntrada(dados);

            expect(EntradaRepository.criar).toHaveBeenCalledWith(
                expect.objectContaining({ rastreamento: null })
            );
        });

        test('deve rejeitar campos obrigatórios faltando', async () => {
            await expect(
                EntradaService.criarEntrada({ id_usuario: 1 })
            ).rejects.toEqual({
                status: 400,
                mensagem: 'Campos obrigatórios faltando: id_fornecedor, id_produto, data, id_lote, quantidade'
            });

            expect(UsuarioRepository.buscarPorId).not.toHaveBeenCalled();
        });

        test('deve rejeitar quando id_usuario não for informado', async () => {
            const dados = { ...dadosValidos };
            delete dados.id_usuario;

            await expect(
                EntradaService.criarEntrada(dados)
            ).rejects.toMatchObject({ status: 400 });
        });

        test('deve rejeitar quantidade zero', async () => {
            await expect(
                EntradaService.criarEntrada({ ...dadosValidos, quantidade: 0 })
            ).rejects.toEqual({
                status: 400,
                mensagem: 'A quantidade deve ser um número inteiro maior que zero'
            });
        });

        test('deve rejeitar quantidade negativa', async () => {
            await expect(
                EntradaService.criarEntrada({ ...dadosValidos, quantidade: -5 })
            ).rejects.toEqual({
                status: 400,
                mensagem: 'A quantidade deve ser um número inteiro maior que zero'
            });
        });

        test('deve rejeitar quantidade decimal', async () => {
            await expect(
                EntradaService.criarEntrada({ ...dadosValidos, quantidade: 10.5 })
            ).rejects.toEqual({
                status: 400,
                mensagem: 'A quantidade deve ser um número inteiro maior que zero'
            });
        });

        test('deve rejeitar quantidade que não seja número', async () => {
            await expect(
                EntradaService.criarEntrada({ ...dadosValidos, quantidade: '10' })
            ).rejects.toEqual({
                status: 400,
                mensagem: 'A quantidade deve ser um número inteiro maior que zero'
            });
        });

        test('deve rejeitar usuário inexistente', async () => {
            UsuarioRepository.buscarPorId.mockResolvedValue(null);

            await expect(
                EntradaService.criarEntrada(dadosValidos)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Usuário informado não existe'
            });

            expect(FornecedorRepository.buscarPorId).not.toHaveBeenCalled();
        });

        test('deve rejeitar fornecedor inexistente', async () => {
            FornecedorRepository.buscarPorId.mockResolvedValue(null);

            await expect(
                EntradaService.criarEntrada(dadosValidos)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Fornecedor informado não existe'
            });

            expect(ProdutoRepository.buscarPorId).not.toHaveBeenCalled();
        });

        test('deve rejeitar produto inexistente', async () => {
            ProdutoRepository.buscarPorId.mockResolvedValue(null);

            await expect(
                EntradaService.criarEntrada(dadosValidos)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Produto informado não existe'
            });

            expect(LoteRepository.buscarPorId).not.toHaveBeenCalled();
        });

        test('deve rejeitar lote inexistente', async () => {
            LoteRepository.buscarPorId.mockResolvedValue(null);

            await expect(
                EntradaService.criarEntrada(dadosValidos)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Lote informado não existe'
            });

            expect(EstoqueRepository.buscarPorLote).not.toHaveBeenCalled();
        });

        test('deve rejeitar lote que não pertence ao produto', async () => {
            LoteRepository.buscarPorId.mockResolvedValue({ id_lote: 7, id_produto: 99 });

            await expect(
                EntradaService.criarEntrada(dadosValidos)
            ).rejects.toEqual({
                status: 400,
                mensagem: 'O lote informado não pertence ao produto informado'
            });
        });

        test('deve rejeitar quando estoque do lote não existir', async () => {
            EstoqueRepository.buscarPorLote.mockResolvedValue(null);

            await expect(
                EntradaService.criarEntrada(dadosValidos)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Estoque não encontrado para o lote informado'
            });

            expect(EntradaRepository.criar).not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // atualizarEntrada
    // ==========================================

    describe('atualizarEntrada', () => {

        const entradaExistente = {
            id_entrada: 1,
            id_usuario: 1,
            id_fornecedor: 2,
            id_produto: 3,
            id_lote: 7,
            quantidade: 10
        };

        test('deve rejeitar ID inválido', async () => {
            await expect(
                EntradaService.atualizarEntrada('abc', {})
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });
        });

        test('deve rejeitar entrada inexistente', async () => {
            EntradaRepository.buscarPorId.mockResolvedValue(null);

            await expect(
                EntradaService.atualizarEntrada(999, {})
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Movimentação de entrada não encontrada'
            });
        });

        test('deve rejeitar quando nenhum campo for informado', async () => {
            EntradaRepository.buscarPorId.mockResolvedValue(entradaExistente);

            await expect(
                EntradaService.atualizarEntrada(1, {})
            ).rejects.toEqual({
                status: 400,
                mensagem: 'Nenhum campo para atualizar'
            });
        });

        test('deve atualizar dados simples da entrada (sem alterar estoque)', async () => {
            EntradaRepository.buscarPorId
                .mockResolvedValueOnce(entradaExistente)
                .mockResolvedValueOnce({ ...entradaExistente, data: '2026-09-29' });

            LoteRepository.buscarPorId.mockResolvedValue({ id_lote: 7, id_produto: 3 });
            EstoqueRepository.buscarPorLote.mockResolvedValue({ id_estoque: 5, qtd_atual: 50 });
            EntradaRepository.atualizar.mockResolvedValue(true);

            const resultado = await EntradaService.atualizarEntrada(1, { data: '2026-09-29' });

            expect(EntradaRepository.atualizar).toHaveBeenCalledWith(1, { data: '2026-09-29' });
            expect(EstoqueRepository.alterarQuantidade).not.toHaveBeenCalled();
            expect(resultado.sucesso).toBe(true);
        });

        test('deve rejeitar tentativa de alterar o usuário', async () => {
            EntradaRepository.buscarPorId.mockResolvedValue(entradaExistente);

            await expect(
                EntradaService.atualizarEntrada(1, { id_usuario: 999 })
            ).rejects.toEqual({
                status: 400,
                mensagem: 'Não é permitido alterar o usuário de uma movimentação'
            });
        });

        test('deve rejeitar fornecedor inexistente na atualização', async () => {
            EntradaRepository.buscarPorId.mockResolvedValue(entradaExistente);
            FornecedorRepository.buscarPorId.mockResolvedValue(null);

            await expect(
                EntradaService.atualizarEntrada(1, { id_fornecedor: 999 })
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Fornecedor informado não existe'
            });
        });

        test('deve rejeitar produto inexistente na atualização', async () => {
            EntradaRepository.buscarPorId.mockResolvedValue(entradaExistente);
            ProdutoRepository.buscarPorId.mockResolvedValue(null);

            await expect(
                EntradaService.atualizarEntrada(1, { id_produto: 999 })
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Produto informado não existe'
            });
        });

        test('deve rejeitar quantidade inválida na atualização', async () => {
            EntradaRepository.buscarPorId.mockResolvedValue(entradaExistente);

            await expect(
                EntradaService.atualizarEntrada(1, { quantidade: 0 })
            ).rejects.toEqual({
                status: 400,
                mensagem: 'A quantidade deve ser um número inteiro maior que zero'
            });
        });

        test('deve atualizar quantidade e ajustar estoque (mesmo lote)', async () => {
            EntradaRepository.buscarPorId
                .mockResolvedValueOnce(entradaExistente)
                .mockResolvedValueOnce({ ...entradaExistente, quantidade: 15 });

            LoteRepository.buscarPorId.mockResolvedValue({ id_lote: 7, id_produto: 3 });
            EstoqueRepository.buscarPorLote.mockResolvedValue({ id_estoque: 5, qtd_atual: 50 });
            EstoqueRepository.alterarQuantidade.mockResolvedValue(true);
            EntradaRepository.atualizar.mockResolvedValue(true);

            const resultado = await EntradaService.atualizarEntrada(1, { quantidade: 15 });

            // diferenca = 15 - 10 = +5
            expect(EstoqueRepository.alterarQuantidade).toHaveBeenCalledWith(5, 5);
            expect(EntradaRepository.atualizar).toHaveBeenCalledWith(1, { quantidade: 15 });
            expect(resultado.sucesso).toBe(true);
        });

        test('deve rejeitar estoque antigo inexistente', async () => {
            EntradaRepository.buscarPorId.mockResolvedValue(entradaExistente);
            LoteRepository.buscarPorId.mockResolvedValue({ id_lote: 7, id_produto: 3 });
            EstoqueRepository.buscarPorLote.mockResolvedValue(null);

            await expect(
                EntradaService.atualizarEntrada(1, { quantidade: 15 })
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Estoque antigo não encontrado'
            });
        });

        test('deve mover quantidade entre estoques quando lote mudar', async () => {
            EntradaRepository.buscarPorId
                .mockResolvedValueOnce(entradaExistente)
                .mockResolvedValueOnce({ ...entradaExistente, id_lote: 8 });

            LoteRepository.buscarPorId
                .mockResolvedValue({ id_lote: 8, id_produto: 3 });

            EstoqueRepository.buscarPorLote
                .mockResolvedValueOnce({ id_estoque: 5, qtd_atual: 50 })   // estoque antigo
                .mockResolvedValueOnce({ id_estoque: 6, qtd_atual: 20 });  // estoque novo

            EstoqueRepository.alterarQuantidade.mockResolvedValue(true);
            EntradaRepository.atualizar.mockResolvedValue(true);

            await EntradaService.atualizarEntrada(1, { id_lote: 8 });

            // remove do estoque antigo
            expect(EstoqueRepository.alterarQuantidade).toHaveBeenNthCalledWith(1, 5, -10);
            // adiciona no estoque novo
            expect(EstoqueRepository.alterarQuantidade).toHaveBeenNthCalledWith(2, 6, 10);
        });

        test('deve rejeitar estoque novo inexistente ao trocar lote', async () => {
            EntradaRepository.buscarPorId.mockResolvedValue(entradaExistente);

            LoteRepository.buscarPorId.mockResolvedValue({ id_lote: 8, id_produto: 3 });

            EstoqueRepository.buscarPorLote
                .mockResolvedValueOnce({ id_estoque: 5, qtd_atual: 50 })  // estoque antigo existe
                .mockResolvedValueOnce(null);                               // estoque novo não existe

            await expect(
                EntradaService.atualizarEntrada(1, { id_lote: 8 })
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Estoque novo não encontrado para o lote informado'
            });

            expect(EstoqueRepository.alterarQuantidade).not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // removerEntrada
    // ==========================================

    describe('removerEntrada', () => {

        test('deve remover entrada com sucesso', async () => {
            EntradaRepository.buscarPorId.mockResolvedValue({ id_entrada: 1 });
            EntradaRepository.remover.mockResolvedValue(true);

            const resultado = await EntradaService.removerEntrada(1);

            expect(EntradaRepository.buscarPorId).toHaveBeenCalledWith(1);
            expect(EntradaRepository.remover).toHaveBeenCalledWith(1);
            expect(resultado).toEqual({
                sucesso: true,
                mensagem: 'Movimentação de entrada removida com sucesso'
            });
        });

        test('deve rejeitar ID inválido', async () => {
            await expect(
                EntradaService.removerEntrada('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

            expect(EntradaRepository.buscarPorId).not.toHaveBeenCalled();
        });

        test('deve rejeitar entrada inexistente', async () => {
            EntradaRepository.buscarPorId.mockResolvedValue(null);

            await expect(
                EntradaService.removerEntrada(999)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Movimentação de entrada não encontrada'
            });

            expect(EntradaRepository.remover).not.toHaveBeenCalled();
        });
    });
});
