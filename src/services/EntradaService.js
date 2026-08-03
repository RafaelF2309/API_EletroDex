const EntradaRepository = require('../repositories/EntradaRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const FornecedorRepository = require('../repositories/FornecedorRepository');
const ProdutoRepository = require('../repositories/ProdutoRepository');

class EntradaService {
    async listarEntradas() {
        const entradas = await EntradaRepository.listarTodos();
        return { sucesso: true, dados: entradas, total: entradas.length };
    }

    async buscarEntradaPorId(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const entrada = await EntradaRepository.buscarPorId(id);

        if (!entrada) {
            throw { status: 404, mensagem: 'Movimentação de entrada não encontrada' };
        }

        return { sucesso: true, dados: entrada };
    }

    async criarEntrada(dados) {
        const { id_usuario, id_fornecedor, id_produto, data, lote, quantidade, rastreamento } = dados;

        if (!id_usuario || !id_fornecedor || !id_produto || !data || !lote || quantidade == null) {
            throw {
                status: 400,
                mensagem: 'Campos obrigatórios faltando: id_usuario, id_fornecedor, id_produto, data, lote, quantidade'
            };
        }

        if (quantidade <= 0) {
            throw { status: 400, mensagem: 'A quantidade deve ser maior que zero' };
        }

        const usuario = await UsuarioRepository.buscarPorId(id_usuario);
        if (!usuario) {
            throw { status: 404, mensagem: 'Usuário informado não existe' };
        }

        const fornecedor = await FornecedorRepository.buscarPorId(id_fornecedor);
        if (!fornecedor) {
            throw { status: 404, mensagem: 'Fornecedor informado não existe' };
        }

        const produto = await ProdutoRepository.buscarPorId(id_produto);
        if (!produto) {
            throw { status: 404, mensagem: 'Produto informado não existe' };
        }

        const novoId = await EntradaRepository.criar({
            id_usuario, id_fornecedor, id_produto, data, lote, quantidade, rastreamento: rastreamento ?? null
        });
        const entradaCriada = await EntradaRepository.buscarPorId(novoId);

        return { sucesso: true, mensagem: 'Movimentação de entrada cadastrada com sucesso', dados: entradaCriada };
    }

    async atualizarEntrada(id, dados) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const entradaExiste = await EntradaRepository.buscarPorId(id);
        if (!entradaExiste) {
            throw { status: 404, mensagem: 'Movimentação de entrada não encontrada' };
        }

        const { id_usuario, id_fornecedor, id_produto, data, lote, quantidade, rastreamento } = dados;
        const dadosAtualizados = {};

        if (id_usuario !== undefined) dadosAtualizados.id_usuario = id_usuario;
        if (id_fornecedor !== undefined) dadosAtualizados.id_fornecedor = id_fornecedor;
        if (id_produto !== undefined) dadosAtualizados.id_produto = id_produto;
        if (data !== undefined) dadosAtualizados.data = data;
        if (lote !== undefined) dadosAtualizados.lote = lote;
        if (quantidade !== undefined) {
            if (quantidade <= 0) {
                throw { status: 400, mensagem: 'A quantidade deve ser maior que zero' };
            }
            dadosAtualizados.quantidade = quantidade;
        }
        if (rastreamento !== undefined) dadosAtualizados.rastreamento = rastreamento;

        if (Object.keys(dadosAtualizados).length === 0) {
            throw { status: 400, mensagem: 'Nenhum campo para atualizar' };
        }

        await EntradaRepository.atualizar(id, dadosAtualizados);
        const entradaAtualizada = await EntradaRepository.buscarPorId(id);

        return { sucesso: true, mensagem: 'Movimentação de entrada atualizada com sucesso', dados: entradaAtualizada };
    }

    async removerEntrada(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const entradaExiste = await EntradaRepository.buscarPorId(id);
        if (!entradaExiste) {
            throw { status: 404, mensagem: 'Movimentação de entrada não encontrada' };
        }

        await EntradaRepository.remover(id);
        return { sucesso: true, mensagem: 'Movimentação de entrada removida com sucesso' };
    }
}

module.exports = new EntradaService();
