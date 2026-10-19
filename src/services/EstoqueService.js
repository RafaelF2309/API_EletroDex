const EstoqueRepository = require('../repositories/EstoqueRepository');
const ProdutoRepository = require('../repositories/ProdutoRepository');
const LoteRepository = require('../repositories/LoteRepository');

class EstoqueService {
    async listarEstoques(filtros = {}) {
        const page = filtros.page !== undefined ? parseInt(filtros.page, 10) : null;
        const limit = filtros.limit !== undefined ? parseInt(filtros.limit, 10) : null;

        const estoques = await EstoqueRepository.listarTodos(filtros);
        const formatados = estoques.map(e => ({
            ...e,
            qtd_atual: Number(e.qtd_atual),
            estoque_minimo: e.estoque_minimo != null ? Number(e.estoque_minimo) : 0
        }));
        const total = estoques.total !== undefined ? estoques.total : formatados.length;

        const resposta = { sucesso: true, dados: formatados, total };
        if (page !== null || limit !== null) {
            const paginaAtual = page && page > 0 ? page : 1;
            const limiteAtual = limit && limit > 0 ? limit : (total || 10);
            resposta.pagina = paginaAtual;
            resposta.limite = limiteAtual;
            resposta.total_paginas = Math.ceil(total / limiteAtual) || 1;
        }
        return resposta;
    }

    async ajustarEstoque(id, dados, id_usuario) {
        if (!id || isNaN(id)) throw { status: 400, mensagem: 'ID inválido' };
        const diferenca = Number(dados.diferenca);
        const motivo = typeof dados.motivo === 'string' ? dados.motivo.trim() : '';
        if (!Number.isInteger(diferenca) || diferenca === 0) {
            throw { status: 400, mensagem: 'diferenca deve ser um número inteiro diferente de zero' };
        }
        if (!motivo || motivo.length > 200) {
            throw { status: 400, mensagem: 'motivo é obrigatório e deve ter no máximo 200 caracteres' };
        }
        const resultado = await EstoqueRepository.ajustarComAuditoria(id, id_usuario, diferenca, motivo);
        return { sucesso: true, mensagem: 'Estoque ajustado e auditado com sucesso', dados: resultado };
    }

    async buscarEstoquePorId(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const estoque = await EstoqueRepository.buscarPorId(id);

        if (!estoque) {
            throw { status: 404, mensagem: 'Registro de estoque não encontrado' };
        }

        return {
            sucesso: true,
            dados: {
                ...estoque,
                qtd_atual: Number(estoque.qtd_atual),
                estoque_minimo: estoque.estoque_minimo != null ? Number(estoque.estoque_minimo) : 0
            }
        };
    }

    async criarEstoque(dados) {
        const { id_produto, id_lote, qtd_atual, localizacao_corredor, localizacao_prateleira } = dados;

        // Campos obrigatórios – qtd_atual pode ser zero (estoque inicial)
        if (!id_produto || !id_lote || qtd_atual == null || !localizacao_corredor || !localizacao_prateleira) {
            throw {
                status: 400,
                mensagem: 'Campos obrigatórios faltando: id_produto, id_lote, qtd_atual, localizacao_corredor, localizacao_prateleira'
            };
        }

        // qtd_atual deve ser zero ao criar estoque (saldo inicial será ajustado via loteService)
        if (Number(qtd_atual) !== 0) {
            throw { status: 400, mensagem: 'A quantidade atual ao criar estoque deve ser 0' };
        }

        const produto = await ProdutoRepository.buscarPorId(id_produto);
        if (!produto) {
            throw { status: 404, mensagem: 'Produto informado não existe' };
        }

        const lote = await LoteRepository.buscarPorId(id_lote);
        if (!lote) {
            throw { status: 404, mensagem: 'Lote informado não existe' };
        }

        // Verifica se o lote já possui registro de estoque
        const estoqueExistente = await EstoqueRepository.buscarPorLote(id_lote);
        if (estoqueExistente) {
            throw { status: 409, mensagem: 'Estoque já cadastrado para este lote' };
        }

        // Garante que o lote pertence ao produto informado
        if (Number(lote.id_produto) !== Number(id_produto)) {
            throw { status: 400, mensagem: 'id_produto não corresponde ao lote informado' };
        }

        const novoId = await EstoqueRepository.criar({
            id_produto,
            id_lote,
            qtd_atual: 0,
            localizacao_corredor,
            localizacao_prateleira
        });
        const estoqueCriado = await this.buscarEstoquePorId(novoId);

        return { sucesso: true, mensagem: 'Registro de estoque criado com sucesso', dados: estoqueCriado.dados };
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

        if (qtd_atual !== undefined) {
            throw { status: 400, mensagem: 'qtd_atual só pode ser alterada pelo endpoint de ajuste auditável' };
        }

        if (id_produto !== undefined) dadosAtualizados.id_produto = id_produto;
        if (id_lote !== undefined) dadosAtualizados.id_lote = id_lote;
        if (localizacao_corredor !== undefined) dadosAtualizados.localizacao_corredor = localizacao_corredor;
        if (localizacao_prateleira !== undefined) dadosAtualizados.localizacao_prateleira = localizacao_prateleira;

        if (Object.keys(dadosAtualizados).length === 0) {
            throw { status: 400, mensagem: 'Nenhum campo para atualizar' };
        }

        await EstoqueRepository.atualizar(id, dadosAtualizados);
        const estoqueAtualizado = await this.buscarEstoquePorId(id);

        return { sucesso: true, mensagem: 'Registro de estoque atualizado com sucesso', dados: estoqueAtualizado.dados };
    }

    async removerEstoque(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const estoqueExiste = await EstoqueRepository.buscarPorId(id);
        if (!estoqueExiste) {
            throw { status: 404, mensagem: 'Registro de estoque não encontrado' };
        }

        if (estoqueExiste.qtd_atual > 0) {
            throw { status: 409, mensagem: 'Estoque com saldo positivo não pode ser removido' };
        }

        await EstoqueRepository.remover(id);
        return { sucesso: true, mensagem: 'Registro de estoque removido com sucesso' };
    }

    async listarAjustes(filtros = {}) {
        const page = filtros.page !== undefined ? parseInt(filtros.page, 10) : null;
        const limit = filtros.limit !== undefined ? parseInt(filtros.limit, 10) : null;

        const ajustes = await EstoqueRepository.listarAjustes(filtros);
        const formatados = ajustes.map(a => ({
            ...a,
            qtd_anterior: Number(a.qtd_anterior),
            diferenca: Number(a.diferenca),
            qtd_nova: Number(a.qtd_nova)
        }));
        const total = ajustes.total !== undefined ? ajustes.total : formatados.length;

        const resposta = { sucesso: true, dados: formatados, total };
        if (page !== null || limit !== null) {
            const paginaAtual = page && page > 0 ? page : 1;
            const limiteAtual = limit && limit > 0 ? limit : (total || 10);
            resposta.pagina = paginaAtual;
            resposta.limite = limiteAtual;
            resposta.total_paginas = Math.ceil(total / limiteAtual) || 1;
        }
        return resposta;
    }

    async listarAjustesPorEstoque(id, filtros = {}) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const estoqueExiste = await EstoqueRepository.buscarPorId(id);
        if (!estoqueExiste) {
            throw { status: 404, mensagem: 'Registro de estoque não encontrado' };
        }

        return await this.listarAjustes({ ...filtros, id_estoque: Number(id) });
    }
}

module.exports = new EstoqueService();
