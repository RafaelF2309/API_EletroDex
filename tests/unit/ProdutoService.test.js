jest.mock('../../src/repositories/ProdutoRepository');

const ProdutoService = require('../../src/services/ProdutoService');
const ProdutoRepository = require('../../src/repositories/ProdutoRepository');

describe('ProdutoService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listarProdutos', () => {

        test('deve listar e formatar os produtos', async () => {

            const produtos = [
                {
                    id_produto: 1,
                    nome: 'Arroz',
                    qtd_atual: '10',
                    estoque_minimo: '5',
                    abaixo_do_minimo: 0
                },
                {
                    id_produto: 2,
                    nome: 'Feijão',
                    qtd_atual: '3',
                    estoque_minimo: '5',
                    abaixo_do_minimo: 1
                }
            ];

            ProdutoRepository.listarTodos
                .mockResolvedValue(produtos);

            const resultado =
                await ProdutoService.listarProdutos();

            expect(resultado.sucesso).toBe(true);
            expect(resultado.total).toBe(2);

            expect(resultado.dados[0].qtd_atual)
                .toBe(10);

            expect(resultado.dados[0].estoque_minimo)
                .toBe(5);

            expect(resultado.dados[0].abaixo_do_minimo)
                .toBe(false);

            expect(resultado.dados[1].abaixo_do_minimo)
                .toBe(true);

            expect(
                ProdutoRepository.listarTodos
            ).toHaveBeenCalled();
        });

    });

    describe('listarProdutosAbaixoDoMinimo', () => {

        test('deve listar produtos abaixo do estoque mínimo', async () => {

            const produtos = [
                {
                    id_produto: 2,
                    nome: 'Feijão',
                    qtd_atual: '3',
                    estoque_minimo: '5',
                    diferenca_para_minimo: '2'
                }
            ];

            ProdutoRepository.listarAbaixoDoMinimo
                .mockResolvedValue(produtos);

            const resultado =
                await ProdutoService.listarProdutosAbaixoDoMinimo();

            expect(resultado.sucesso).toBe(true);
            expect(resultado.total).toBe(1);

            expect(resultado.dados[0].qtd_atual)
                .toBe(3);

            expect(resultado.dados[0].estoque_minimo)
                .toBe(5);

            expect(resultado.dados[0].abaixo_do_minimo)
                .toBe(true);

            expect(resultado.dados[0].diferenca_para_minimo)
                .toBe(2);

            expect(
                ProdutoRepository.listarAbaixoDoMinimo
            ).toHaveBeenCalled();
        });

    });

    describe('buscarProdutoPorId', () => {

        test('deve retornar e formatar o produto existente', async () => {

            const produto = {
                id_produto: 1,
                nome: 'Arroz',
                qtd_atual: '10',
                estoque_minimo: '5',
                abaixo_do_minimo: 0
            };

            ProdutoRepository.buscarPorId
                .mockResolvedValue(produto);

            const resultado =
                await ProdutoService.buscarProdutoPorId(1);

            expect(resultado.sucesso).toBe(true);
            expect(resultado.dados).toEqual({
                ...produto,
                qtd_atual: 10,
                estoque_minimo: 5,
                abaixo_do_minimo: false
            });

            expect(
                ProdutoRepository.buscarPorId
            ).toHaveBeenCalledWith(1);
        });

        test('deve rejeitar ID inválido', async () => {

            await expect(
                ProdutoService.buscarProdutoPorId('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

        });

        test('deve rejeitar produto inexistente', async () => {

            ProdutoRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                ProdutoService.buscarProdutoPorId(999)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Produto não encontrado'
            });

        });

    });

    describe('criarProduto', () => {

        test('deve criar um produto com sucesso', async () => {

            ProdutoRepository.buscarPorCodBarras
                .mockResolvedValue(null);

            ProdutoRepository.criar
                .mockResolvedValue(10);

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 10,
                    nome: 'Arroz',
                    cod_barras: '123456',
                    preco: 20,
                    estoque_minimo: 5,
                    qtd_atual: 0,
                    abaixo_do_minimo: true
                });

            const resultado =
                await ProdutoService.criarProduto({
                    nome: 'Arroz',
                    descricao: 'Arroz branco',
                    estoque_minimo: 5,
                    cod_barras: '123456',
                    preco: '20'
                });

            expect(resultado.sucesso).toBe(true);

            expect(resultado.mensagem)
                .toBe('Produto cadastrado com sucesso');

            expect(resultado.dados.id_produto)
                .toBe(10);

            expect(
                ProdutoRepository.criar
            ).toHaveBeenCalledWith({
                nome: 'Arroz',
                descricao: 'Arroz branco',
                estoque_minimo: 5,
                cod_barras: '123456',
                preco: 20,
                imagem: null
            });

        });

        test('deve rejeitar campos obrigatórios faltando', async () => {

            await expect(
                ProdutoService.criarProduto({})
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Campos obrigatórios faltando: nome, cod_barras, preco'
            });

        });

        test('deve rejeitar código de barras duplicado', async () => {

            ProdutoRepository.buscarPorCodBarras
                .mockResolvedValue({
                    id_produto: 1,
                    cod_barras: '123456'
                });

            await expect(
                ProdutoService.criarProduto({
                    nome: 'Arroz',
                    cod_barras: '123456',
                    preco: 20
                })
            ).rejects.toEqual({
                status: 409,
                mensagem:
                    'Já existe um produto cadastrado com este código de barras'
            });

        });

        test('deve rejeitar preço inválido', async () => {

            ProdutoRepository.buscarPorCodBarras
                .mockResolvedValue(null);

            await expect(
                ProdutoService.criarProduto({
                    nome: 'Arroz',
                    cod_barras: '123456',
                    preco: 0
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Preço deve ser um número positivo'
            });

        });

        test('deve rejeitar estoque mínimo negativo', async () => {

            ProdutoRepository.buscarPorCodBarras
                .mockResolvedValue(null);

            await expect(
                ProdutoService.criarProduto({
                    nome: 'Arroz',
                    cod_barras: '123456',
                    preco: 20,
                    estoque_minimo: -1
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Estoque mínimo deve ser um número válido (maior ou igual a zero)'
            });

        });

    });

    describe('atualizarProduto', () => {

        test('deve atualizar um produto com sucesso', async () => {

            const produtoAtual = {
                id_produto: 1,
                nome: 'Arroz',
                cod_barras: '123456',
                preco: 20,
                estoque_minimo: 5
            };

            const produtoAtualizado = {
                id_produto: 1,
                nome: 'Arroz Integral',
                cod_barras: '123456',
                preco: 25,
                estoque_minimo: 10,
                qtd_atual: 3,
                abaixo_do_minimo: true
            };

            ProdutoRepository.buscarPorId
                .mockResolvedValueOnce(produtoAtual)
                .mockResolvedValueOnce(produtoAtualizado);

            ProdutoRepository.atualizar
                .mockResolvedValue(true);

            const resultado =
                await ProdutoService.atualizarProduto(1, {
                    nome: 'Arroz Integral',
                    preco: 25,
                    estoque_minimo: 10
                });

            expect(resultado.sucesso).toBe(true);

            expect(resultado.mensagem)
                .toBe('Produto atualizado com sucesso');

            expect(resultado.dados)
                .toEqual({
                    ...produtoAtualizado,
                    qtd_atual: 3,
                    estoque_minimo: 10,
                    abaixo_do_minimo: true
                });

            expect(
                ProdutoRepository.atualizar
            ).toHaveBeenCalledWith(1, {
                nome: 'Arroz Integral',
                estoque_minimo: 10,
                preco: 25
            });

        });

        test('deve rejeitar ID inválido', async () => {

            await expect(
                ProdutoService.atualizarProduto('abc', {
                    nome: 'Novo produto'
                })
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

        });

        test('deve rejeitar produto inexistente', async () => {

            ProdutoRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                ProdutoService.atualizarProduto(999, {
                    nome: 'Novo produto'
                })
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Produto não encontrado'
            });

        });

        test('deve rejeitar nome vazio', async () => {

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 1,
                    nome: 'Arroz',
                    cod_barras: '123456'
                });

            await expect(
                ProdutoService.atualizarProduto(1, {
                    nome: ''
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'O nome do produto não pode ser vazio'
            });

        });

        test('deve rejeitar código de barras duplicado', async () => {

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 1,
                    nome: 'Arroz',
                    cod_barras: '123456'
                });

            ProdutoRepository.buscarPorCodBarras
                .mockResolvedValue({
                    id_produto: 2,
                    nome: 'Feijão',
                    cod_barras: '999999'
                });

            await expect(
                ProdutoService.atualizarProduto(1, {
                    cod_barras: '999999'
                })
            ).rejects.toEqual({
                status: 409,
                mensagem:
                    'Já existe outro produto cadastrado com este código de barras'
            });

        });

        test('deve rejeitar estoque mínimo negativo', async () => {

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 1,
                    nome: 'Arroz',
                    cod_barras: '123456'
                });

            await expect(
                ProdutoService.atualizarProduto(1, {
                    estoque_minimo: -5
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Estoque mínimo deve ser um número válido'
            });

        });

        test('deve rejeitar preço inválido', async () => {

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 1,
                    nome: 'Arroz',
                    cod_barras: '123456'
                });

            await expect(
                ProdutoService.atualizarProduto(1, {
                    preco: 0
                })
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Preço deve ser um número positivo'
            });

        });

        test('deve rejeitar quando nenhum campo for informado', async () => {

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 1,
                    nome: 'Arroz',
                    cod_barras: '123456'
                });

            await expect(
                ProdutoService.atualizarProduto(1, {})
            ).rejects.toEqual({
                status: 400,
                mensagem:
                    'Nenhum campo válido para atualizar'
            });

        });

    });

    describe('removerProduto', () => {

        test('deve remover produto sem dependências', async () => {

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 1,
                    nome: 'Arroz'
                });

            ProdutoRepository.contarDependencias
                .mockResolvedValue(0);

            ProdutoRepository.remover
                .mockResolvedValue(true);

            const resultado =
                await ProdutoService.removerProduto(1);

            expect(resultado.sucesso).toBe(true);

            expect(resultado.mensagem)
                .toBe('Produto removido com sucesso');

            expect(
                ProdutoRepository.remover
            ).toHaveBeenCalledWith(1);

        });

        test('deve rejeitar ID inválido', async () => {

            await expect(
                ProdutoService.removerProduto('abc')
            ).rejects.toEqual({
                status: 400,
                mensagem: 'ID inválido'
            });

        });

        test('deve rejeitar produto inexistente', async () => {

            ProdutoRepository.buscarPorId
                .mockResolvedValue(null);

            await expect(
                ProdutoService.removerProduto(999)
            ).rejects.toEqual({
                status: 404,
                mensagem: 'Produto não encontrado'
            });

        });

        test('deve rejeitar produto com dependências', async () => {

            ProdutoRepository.buscarPorId
                .mockResolvedValue({
                    id_produto: 1,
                    nome: 'Arroz'
                });

            ProdutoRepository.contarDependencias
                .mockResolvedValue(3);

            await expect(
                ProdutoService.removerProduto(1)
            ).rejects.toEqual({
                status: 409,
                mensagem:
                    'Produto possui lotes, estoque ou movimentações vinculadas e não pode ser removido'
            });

            expect(
                ProdutoRepository.remover
            ).not.toHaveBeenCalled();

        });

    });

});