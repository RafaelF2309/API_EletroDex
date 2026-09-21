const LoteRepository = require('../repositories/LoteRepository');
const ProdutoRepository = require('../repositories/ProdutoRepository');
const FornecedorRepository = require('../repositories/FornecedorRepository');

class LoteService {
    async listarLotes() {
        const lotes = await LoteRepository.listarTodos();
        return { sucesso: true, dados: lotes, total: lotes.length };
    }

    async buscarLotePorId(id) {
        if (!id || isNaN(id)) throw { status: 400, mensagem: 'ID inválido' };
        const lote = await LoteRepository.buscarPorId(id);
        if (!lote) throw { status: 404, mensagem: 'Lote não encontrado' };
        return { sucesso: true, dados: lote };
    }

    async criarLote(dados) {
        const { id_produto, numero_lote, dt_fabricacao, dt_validade, quantidade_inicial, id_fornecedor } = dados;
        if (!id_produto || !numero_lote || !dt_fabricacao || !dt_validade || quantidade_inicial == null || !id_fornecedor) {
            throw { status: 400, mensagem: 'Campos obrigatórios faltando: id_produto, numero_lote, dt_fabricacao, dt_validade, quantidade_inicial, id_fornecedor' };
        }
        if (!Number.isInteger(Number(quantidade_inicial)) || Number(quantidade_inicial) <= 0) {
            throw { status: 400, mensagem: 'quantidade_inicial deve ser um número inteiro maior que zero' };
        }

        if (!await ProdutoRepository.buscarPorId(id_produto)) {
            throw { status: 404, mensagem: 'Produto informado não existe' };
        }
        if (!await FornecedorRepository.buscarPorId(id_fornecedor)) {
            throw { status: 404, mensagem: 'Fornecedor informado não existe' };
        }
        if (await LoteRepository.buscarPorNumeroLote(numero_lote)) {
            throw { status: 409, mensagem: 'Já existe um lote cadastrado com este número' };
        }

        const quantidade = Number(quantidade_inicial);
        const novoId = await LoteRepository.criarComEstoque(
            { id_produto, numero_lote, dt_fabricacao, dt_validade, quantidade_inicial: quantidade, id_fornecedor },
            {
                id_produto,
                qtd_atual: quantidade,
                localizacao_corredor: dados.localizacao_corredor || 'PENDENTE',
                localizacao_prateleira: dados.localizacao_prateleira || 'PENDENTE'
            }
        );
        const loteCriado = await LoteRepository.buscarPorId(novoId);
        return { sucesso: true, mensagem: 'Lote e estoque inicial cadastrados com sucesso', dados: loteCriado };
    }

    async atualizarLote(id, dados) {
        if (!id || isNaN(id)) throw { status: 400, mensagem: 'ID inválido' };
        if (!await LoteRepository.buscarPorId(id)) throw { status: 404, mensagem: 'Lote não encontrado' };

        const { id_produto, numero_lote, dt_fabricacao, dt_validade, quantidade_inicial, id_fornecedor } = dados;
        const dadosAtualizados = {};
        if (id_produto !== undefined) dadosAtualizados.id_produto = id_produto;
        if (numero_lote !== undefined) dadosAtualizados.numero_lote = numero_lote;
        if (dt_fabricacao !== undefined) dadosAtualizados.dt_fabricacao = dt_fabricacao;
        if (dt_validade !== undefined) dadosAtualizados.dt_validade = dt_validade;
        if (quantidade_inicial !== undefined) dadosAtualizados.quantidade_inicial = quantidade_inicial;
        if (id_fornecedor !== undefined) dadosAtualizados.id_fornecedor = id_fornecedor;
        if (Object.keys(dadosAtualizados).length === 0) throw { status: 400, mensagem: 'Nenhum campo para atualizar' };

        await LoteRepository.atualizar(id, dadosAtualizados);
        return { sucesso: true, mensagem: 'Lote atualizado com sucesso', dados: await LoteRepository.buscarPorId(id) };
    }

    async removerLote(id) {
        if (!id || isNaN(id)) throw { status: 400, mensagem: 'ID inválido' };
        if (!await LoteRepository.buscarPorId(id)) throw { status: 404, mensagem: 'Lote não encontrado' };
        if (await LoteRepository.contarDependencias(id) > 0) {
            throw { status: 409, mensagem: 'Lote possui estoque ou movimentações vinculadas e não pode ser removido' };
        }
        await LoteRepository.remover(id);
        return { sucesso: true, mensagem: 'Lote removido com sucesso' };
    }
}

module.exports = new LoteService();
