const EstoqueRepository = require('../repositories/EstoqueRepository');
const ProdutoRepository = require('../repositories/ProdutoRepository');
const LoteRepository = require('../repositories/LoteRepository');

class EstoqueService {
    async listarEstoques() {
        const estoques = await EstoqueRepository.listarTodos();
        return { sucesso: true, dados: estoques, total: estoques.length };
    }

    async buscarEstoquePorId(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const estoque = await EstoqueRepository.buscarPorId(id);

        if (!estoque) {
            throw { status: 404, mensagem: 'Registro de estoque não encontrado' };
        }

        return { sucesso: true, dados: estoque };
    }

    async criarEstoque(dados) {
        const { id_produto, id_lote, qtd_atual, localizacao_corredor, localizacao_prateleira } = dados;

        if (!id_produto || !id_lote || qtd_atual == null || !localizacao_corredor || !localizacao_prateleira) {
            throw {
                status: 400,
                mensagem: 'Campos obrigatórios faltando: id_produto, id_lote, qtd_atual, localizacao_corredor, localizacao_prateleira'
            };
        }

        if (qtd_atual <= 0) {
            throw { status: 400, mensagem: 'A quantidade atual deve ser maior que zero' };
        }

        const produto = await ProdutoRepository.buscarPorId(id_produto);
        if (!produto) {
            throw { status: 404, mensagem: 'Produto informado não existe' };
        }

        const lote = await LoteRepository.buscarPorId(id_lote);
        if (!lote) {
            throw { status: 404, mensagem: 'Lote informado não existe' };
        }

        const novoId = await EstoqueRepository.criar({
            id_produto, id_lote, qtd_atual, localizacao_corredor, localizacao_prateleira
        });
        const estoqueCriado = await EstoqueRepository.buscarPorId(novoId);

        return { sucesso: true, mensagem: 'Registro de estoque criado com sucesso', dados: estoqueCriado };
    }

    async atualizarEstoque(id, dados) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const estoqueExiste = await EstoqueRepository.buscarPorId(id);
        if (!estoqueExiste) {
            throw { status: 404, mensagem: 'Registro de estoque não encontrado' };
        }

        const { id_produto, id_lote, qtd_atual, localizacao_corredor, localizacao_prateleira } = dados;
        const dadosAtualizados = {};

        if (id_produto !== undefined) dadosAtualizados.id_produto = id_produto;
        if (id_lote !== undefined) dadosAtualizados.id_lote = id_lote;
        if (qtd_atual !== undefined) {
            if (qtd_atual <= 0) {
                throw { status: 400, mensagem: 'A quantidade atual deve ser maior que zero' };
            }
            dadosAtualizados.qtd_atual = qtd_atual;
        }
        if (localizacao_corredor !== undefined) dadosAtualizados.localizacao_corredor = localizacao_corredor;
        if (localizacao_prateleira !== undefined) dadosAtualizados.localizacao_prateleira = localizacao_prateleira;

        if (Object.keys(dadosAtualizados).length === 0) {
            throw { status: 400, mensagem: 'Nenhum campo para atualizar' };
        }

        await EstoqueRepository.atualizar(id, dadosAtualizados);
        const estoqueAtualizado = await EstoqueRepository.buscarPorId(id);

        return { sucesso: true, mensagem: 'Registro de estoque atualizado com sucesso', dados: estoqueAtualizado };
    }

    async removerEstoque(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const estoqueExiste = await EstoqueRepository.buscarPorId(id);
        if (!estoqueExiste) {
            throw { status: 404, mensagem: 'Registro de estoque não encontrado' };
        }

        await EstoqueRepository.remover(id);
        return { sucesso: true, mensagem: 'Registro de estoque removido com sucesso' };
    }
}

module.exports = new EstoqueService();
