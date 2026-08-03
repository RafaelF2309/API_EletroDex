const LoteRepository = require('../repositories/LoteRepository');
const ProdutoRepository = require('../repositories/ProdutoRepository');
const FornecedorRepository = require('../repositories/FornecedorRepository');

class LoteService {
    async listarLotes() {
        const lotes = await LoteRepository.listarTodos();
        return { sucesso: true, dados: lotes, total: lotes.length };
    }

    async buscarLotePorId(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const lote = await LoteRepository.buscarPorId(id);

        if (!lote) {
            throw { status: 404, mensagem: 'Lote não encontrado' };
        }

        return { sucesso: true, dados: lote };
    }

    async criarLote(dados) {
        const { id_produto, numero_lote, dt_fabricacao, dt_validade, quantidade_inicial, id_fornecedor } = dados;

        if (!id_produto || !numero_lote || !dt_fabricacao || !dt_validade || !quantidade_inicial || !id_fornecedor) {
            throw {
                status: 400,
                mensagem: 'Campos obrigatórios faltando: id_produto, numero_lote, dt_fabricacao, dt_validade, quantidade_inicial, id_fornecedor'
            };
        }

        const produto = await ProdutoRepository.buscarPorId(id_produto);
        if (!produto) {
            throw { status: 404, mensagem: 'Produto informado não existe' };
        }

        const fornecedor = await FornecedorRepository.buscarPorId(id_fornecedor);
        if (!fornecedor) {
            throw { status: 404, mensagem: 'Fornecedor informado não existe' };
        }

        const loteExistente = await LoteRepository.buscarPorNumeroLote(numero_lote);
        if (loteExistente) {
            throw { status: 409, mensagem: 'Já existe um lote cadastrado com este número' };
        }

        const novoId = await LoteRepository.criar({
            id_produto, numero_lote, dt_fabricacao, dt_validade, quantidade_inicial, id_fornecedor
        });
        const loteCriado = await LoteRepository.buscarPorId(novoId);

        return { sucesso: true, mensagem: 'Lote cadastrado com sucesso', dados: loteCriado };
    }

    async atualizarLote(id, dados) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const loteExiste = await LoteRepository.buscarPorId(id);
        if (!loteExiste) {
            throw { status: 404, mensagem: 'Lote não encontrado' };
        }

        const { id_produto, numero_lote, dt_fabricacao, dt_validade, quantidade_inicial, id_fornecedor } = dados;
        const dadosAtualizados = {};

        if (id_produto !== undefined) dadosAtualizados.id_produto = id_produto;
        if (numero_lote !== undefined) dadosAtualizados.numero_lote = numero_lote;
        if (dt_fabricacao !== undefined) dadosAtualizados.dt_fabricacao = dt_fabricacao;
        if (dt_validade !== undefined) dadosAtualizados.dt_validade = dt_validade;
        if (quantidade_inicial !== undefined) dadosAtualizados.quantidade_inicial = quantidade_inicial;
        if (id_fornecedor !== undefined) dadosAtualizados.id_fornecedor = id_fornecedor;

        if (Object.keys(dadosAtualizados).length === 0) {
            throw { status: 400, mensagem: 'Nenhum campo para atualizar' };
        }

        await LoteRepository.atualizar(id, dadosAtualizados);
        const loteAtualizado = await LoteRepository.buscarPorId(id);

        return { sucesso: true, mensagem: 'Lote atualizado com sucesso', dados: loteAtualizado };
    }

    async removerLote(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const loteExiste = await LoteRepository.buscarPorId(id);
        if (!loteExiste) {
            throw { status: 404, mensagem: 'Lote não encontrado' };
        }

        await LoteRepository.remover(id);
        return { sucesso: true, mensagem: 'Lote removido com sucesso' };
    }
}

module.exports = new LoteService();
