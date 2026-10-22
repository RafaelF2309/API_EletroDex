const LoteRepository = require('../repositories/LoteRepository');
const ProdutoRepository = require('../repositories/ProdutoRepository');
const FornecedorRepository = require('../repositories/FornecedorRepository');

class LoteService {
    async listarLotes(filtros = {}) {
        const page = filtros.page !== undefined ? parseInt(filtros.page, 10) : null;
        const limit = filtros.limit !== undefined ? parseInt(filtros.limit, 10) : null;

        const lotes = await LoteRepository.listarTodos(filtros);
        const total = lotes.total !== undefined ? lotes.total : lotes.length;

        const resposta = { sucesso: true, dados: lotes, total };
        if (page !== null || limit !== null) {
            const paginaAtual = page && page > 0 ? page : 1;
            const limiteAtual = limit && limit > 0 ? limit : (total || 10);
            resposta.pagina = paginaAtual;
            resposta.limite = limiteAtual;
            resposta.total_paginas = Math.ceil(total / limiteAtual) || 1;
        }
        return resposta;
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

        const dataFabricacao = new Date(dt_fabricacao);
        const dataValidade = new Date(dt_validade);

        if (isNaN(dataFabricacao.getTime()) || isNaN(dataValidade.getTime())) {
            throw { status: 400, mensagem: 'Formato de data inválido' };
        }

        if (dataValidade <= dataFabricacao) {
            throw { status: 400, mensagem: 'A data de validade deve ser posterior à data de fabricação' };
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

    async listarLotesVencendo(dias) {
        let diasNum = 30;
        if (dias !== undefined && dias !== null && dias !== '') {
            diasNum = parseInt(dias, 10);
            if (isNaN(diasNum) || diasNum < 0) {
                throw { status: 400, mensagem: 'O parâmetro dias deve ser um número maior ou igual a zero' };
            }
        }

        const lotes = await LoteRepository.listarVencendo(diasNum);
        const formatados = lotes.map(l => ({
            ...l,
            quantidade_inicial: Number(l.quantidade_inicial),
            qtd_atual: Number(l.qtd_atual ?? 0),
            dias_para_vencer: Number(l.dias_para_vencer),
            vencido: Boolean(l.vencido)
        }));
        return { sucesso: true, dados: formatados, total: formatados.length };
    }

    async atualizarLote(id, dados) {
        if (!id || isNaN(id)) throw { status: 400, mensagem: 'ID inválido' };
        const loteExiste = await LoteRepository.buscarPorId(id);
        if (!loteExiste) throw { status: 404, mensagem: 'Lote não encontrado' };

        const { id_produto, numero_lote, dt_fabricacao, dt_validade, quantidade_inicial, id_fornecedor } = dados;
        const dadosAtualizados = {};

        // impedir alterações de campos imutáveis
        if (id_produto !== undefined) {
            throw { status: 400, mensagem: 'Alteração de id_produto não é permitida' };
        }
        if (quantidade_inicial !== undefined) {
            throw { status: 400, mensagem: 'Alteração de quantidade_inicial não é permitida' };
        }

        // validar número de lote (unicidade)
        if (numero_lote !== undefined) {
            const loteMesmoNumero = await LoteRepository.buscarPorNumeroLote(numero_lote);
            if (loteMesmoNumero && loteMesmoNumero.id !== Number(id)) {
                throw { status: 409, mensagem: 'Já existe um lote cadastrado com este número' };
            }
            dadosAtualizados.numero_lote = numero_lote;
        }

        // validar datas quando fornecidas
        if (dt_fabricacao !== undefined) dadosAtualizados.dt_fabricacao = dt_fabricacao;
        if (dt_validade !== undefined) dadosAtualizados.dt_validade = dt_validade;
        if (dt_fabricacao !== undefined || dt_validade !== undefined) {
            const dataFabFinal = new Date(dt_fabricacao !== undefined ? dt_fabricacao : loteExiste.dt_fabricacao);
            const dataValFinal = new Date(dt_validade !== undefined ? dt_validade : loteExiste.dt_validade);
            if (isNaN(dataFabFinal.getTime()) || isNaN(dataValFinal.getTime())) {
                throw { status: 400, mensagem: 'Formato de data inválido' };
            }
            if (dataValFinal <= dataFabFinal) {
                throw { status: 400, mensagem: 'A data de validade deve ser posterior à data de fabricação' };
            }
        }

        // validar fornecedor se alterado
        if (id_fornecedor !== undefined) {
            if (!await FornecedorRepository.buscarPorId(id_fornecedor)) {
                throw { status: 404, mensagem: 'Fornecedor informado não existe' };
            }
            dadosAtualizados.id_fornecedor = id_fornecedor;
        }

        if (Object.keys(dadosAtualizados).length === 0) {
            throw { status: 400, mensagem: 'Nenhum campo válido para atualizar' };
        }

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
