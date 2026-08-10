const ProdutoRepository = require('../repositories/ProdutoRepository');

class ProdutoService {
    async listarProdutos() {
        const produtos = await ProdutoRepository.listarTodos();
        return { sucesso: true, dados: produtos, total: produtos.length };
    }

    async buscarProdutoPorId(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const produto = await ProdutoRepository.buscarPorId(id);

        if (!produto) {
            throw { status: 404, mensagem: 'Produto não encontrado' };
        }

        return { sucesso: true, dados: produto };
    }

    async criarProduto(dados) {
        const { nome, descricao, estoque_minimo, cod_barras, preco, imagem } = dados;

        if (!nome || !cod_barras) {
            throw { status: 400, mensagem: 'Campos obrigatórios faltando: nome, cod_barras' };
        }

        const produtoExistente = await ProdutoRepository.buscarPorCodBarras(cod_barras);
        if (produtoExistente) {
            throw { status: 409, mensagem: 'Já existe um produto cadastrado com este código de barras' };
        }

        if (isNaN(preco) || Number(preco) <= 0) {
            throw {
                status: 400,
                mensagem: "Preço deve ser um número positivo",
            };
        }

        const novoProduto = {
            nome,
            descricao: descricao ?? null,
            estoque_minimo: estoque_minimo ?? 0,
            cod_barras, 
            preco, 
            imagem: imagem || null
        };

        const novoId = await ProdutoRepository.criar(novoProduto);
        const produtoCriado = await ProdutoRepository.buscarPorId(novoId);

        return { sucesso: true, mensagem: 'Produto cadastrado com sucesso', dados: produtoCriado };
    }

    async atualizarProduto(id, dados) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const produtoExiste = await ProdutoRepository.buscarPorId(id);
        if (!produtoExiste) {
            throw { status: 404, mensagem: 'Produto não encontrado' };
        }

        const { nome, descricao, estoque_minimo, cod_barras, preco, imagem } = dados;
        const dadosAtualizados = {};

        if (nome !== undefined && nome !== null && nome.trim() !== '') dadosAtualizados.nome = nome.trim();
        if (descricao !== undefined && descricao !== null) {
            dadosAtualizados.descricao = descricao.trim();
        }
        if (estoque_minimo !== undefined) dadosAtualizados.estoque_minimo = estoque_minimo;
        if (cod_barras !== undefined) dadosAtualizados.cod_barras = cod_barras;
        if (preco !== undefined && preco !== null && preco !== '') {
            if (isNaN(preco) || Number(preco) <= 0) {
                throw {
                    status: 400,
                    mensagem: "Preço deve ser um número positivo",
                };
            }
            dadosAtualizados.preco = Number(preco);
        }
        if (imagem !== undefined && imagem !== null) dadosAtualizados.imagem = imagem;

        if (Object.keys(dadosAtualizados).length === 0) {
            throw { status: 400, mensagem: 'Nenhum campo para atualizar' };
        }

        await ProdutoRepository.atualizar(id, dadosAtualizados);
        const produtoAtualizado = await ProdutoRepository.buscarPorId(id);

        return { sucesso: true, mensagem: 'Produto atualizado com sucesso', dados: produtoAtualizado };
    }

    async removerProduto(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const produtoExiste = await ProdutoRepository.buscarPorId(id);
        if (!produtoExiste) {
            throw { status: 404, mensagem: 'Produto não encontrado' };
        }

        await ProdutoRepository.remover(id);
        return { sucesso: true, mensagem: 'Produto removido com sucesso' };
    }
}

module.exports = new ProdutoService();
