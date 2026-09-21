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

        // Validação de campos obrigatórios
        if (!nome || !cod_barras || preco === undefined || preco === null) {
            throw { status: 400, mensagem: 'Campos obrigatórios faltando: nome, cod_barras, preco' };
        }

        // Validação de duplicidade do código de barras
        const produtoExistente = await ProdutoRepository.buscarPorCodBarras(cod_barras);
        if (produtoExistente) {
            throw { status: 409, mensagem: 'Já existe um produto cadastrado com este código de barras' };
        }

        // Validação e conversão de preço
        const precoNumerico = Number(preco);
        if (isNaN(precoNumerico) || precoNumerico <= 0) {
            throw { status: 400, mensagem: 'Preço deve ser um número positivo' };
        }

        // Validação e conversão do estoque mínimo
        const estoqueNumerico = estoque_minimo !== undefined ? Number(estoque_minimo) : 0;
        if (isNaN(estoqueNumerico) || estoqueNumerico < 0) {
            throw { status: 400, mensagem: 'Estoque mínimo deve ser um número válido (maior ou igual a zero)' };
        }

        const novoProduto = {
            nome: String(nome).trim(),
            descricao: descricao ? String(descricao).trim() : null,
            estoque_minimo: estoqueNumerico,
            cod_barras: String(cod_barras).trim(), 
            preco: precoNumerico, 
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

        // Atualização de Nome
        if (nome !== undefined && nome !== null) {
            const nomeFormatado = String(nome).trim();
            if (nomeFormatado === '') {
                throw { status: 400, mensagem: 'O nome do produto não pode ser vazio' };
            }
            dadosAtualizados.nome = nomeFormatado;
        }

        // Atualização de Descrição
        if (descricao !== undefined && descricao !== null) {
            dadosAtualizados.descricao = String(descricao).trim();
        }

        // Atualização de Código de Barras (verificando duplicidade em OUTRO produto)
        if (cod_barras !== undefined && cod_barras !== null) {
            const codBarrasFormatado = String(cod_barras).trim();
            if (codBarrasFormatado !== produtoExiste.cod_barras) {
                const outroProduto = await ProdutoRepository.buscarPorCodBarras(codBarrasFormatado);
                if (outroProduto) {
                    throw { status: 409, mensagem: 'Já existe outro produto cadastrado com este código de barras' };
                }
                dadosAtualizados.cod_barras = codBarrasFormatado;
            }
        }

        // Atualização de Estoque Mínimo
        if (estoque_minimo !== undefined && estoque_minimo !== null) {
            const estoqueNumerico = Number(estoque_minimo);
            if (isNaN(estoqueNumerico) || estoqueNumerico < 0) {
                throw { status: 400, mensagem: 'Estoque mínimo deve ser um número válido' };
            }
            dadosAtualizados.estoque_minimo = estoqueNumerico;
        }

        // Atualização de Preço
        if (preco !== undefined && preco !== null && preco !== '') {
            const precoNumerico = Number(preco);
            if (isNaN(precoNumerico) || precoNumerico <= 0) {
                throw { status: 400, mensagem: 'Preço deve ser um número positivo' };
            }
            dadosAtualizados.preco = precoNumerico;
        }

        // Atualização de Imagem
        if (imagem !== undefined && imagem !== null) {
            dadosAtualizados.imagem = imagem;
        }

        if (Object.keys(dadosAtualizados).length === 0) {
            throw { status: 400, mensagem: 'Nenhum campo válido para atualizar' };
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

        const dependencias = await ProdutoRepository.contarDependencias(id);
        if (dependencias > 0) {
            throw {
                status: 409,
                mensagem: 'Produto possui lotes, estoque ou movimentações vinculadas e não pode ser removido'
            };
        }

        await ProdutoRepository.remover(id);
        return { sucesso: true, mensagem: 'Produto removido com sucesso' };
    }
}

module.exports = new ProdutoService();
