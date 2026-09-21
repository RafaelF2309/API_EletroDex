const SaidaRepository = require('../repositories/SaidaRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const FornecedorRepository = require('../repositories/FornecedorRepository');
const ProdutoRepository = require('../repositories/ProdutoRepository');

class SaidaService {
    async listarSaidas() {
        const saidas = await SaidaRepository.listarTodos();
        return { sucesso: true, dados: saidas, total: saidas.length };
    }

    async buscarSaidaPorId(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const saida = await SaidaRepository.buscarPorId(id);

        if (!saida) {
            throw { status: 404, mensagem: 'Movimentação de saída não encontrada' };
        }

        return { sucesso: true, dados: saida };
    }

    async criarSaida(dados) {
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

        const novoId = await SaidaRepository.criar({
            id_usuario, id_fornecedor, id_produto, data, lote, quantidade, rastreamento: rastreamento ?? null
        });
        const saidaCriada = await SaidaRepository.buscarPorId(novoId);

        return { sucesso: true, mensagem: 'Movimentação de saída cadastrada com sucesso', dados: saidaCriada };
    }

    async atualizarSaida(id, dados) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const saidaExiste = await SaidaRepository.buscarPorId(id);
        if (!saidaExiste) {
            throw { status: 404, mensagem: 'Movimentação de saída não encontrada' };
        }

        const { id_usuario, id_fornecedor, id_produto, data, lote, quantidade, rastreamento } = dados;
        const dadosAtualizados = {};

        if (id_usuario !== undefined) {
            if (!await ProdutoRepository.buscarPorId(id_usuario)){
                throw { status: 404, mensagem: 'Usuário informado não existe' }
            }
            dadosAtualizados.id_usuario = id_usuario;
        } 
        if (id_fornecedor !== undefined) {
            if (!await ProdutoRepository.buscarPorId(id_fornecedor)){
                throw { status: 404, mensagem: 'Fornecedor informado não existe' }
            }
            dadosAtualizados.id_fornecedor = id_fornecedor;
        }
        if (id_produto !== undefined) {
            if (!await ProdutoRepository.buscarPorId(id_produto)) {
                throw { status: 404, mensagem: 'Produto informado não existe' };
            }
            dadosAtualizados.id_produto = id_produto;
        }
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

        await SaidaRepository.atualizar(id, dadosAtualizados);
        const saidaAtualizada = await SaidaRepository.buscarPorId(id);

        return { sucesso: true, mensagem: 'Movimentação de saída atualizada com sucesso', dados: saidaAtualizada };
    }

    async removerSaida(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const saidaExiste = await SaidaRepository.buscarPorId(id);
        if (!saidaExiste) {
            throw { status: 404, mensagem: 'Movimentação de saída não encontrada' };
        }

        await SaidaRepository.remover(id);
        return { sucesso: true, mensagem: 'Movimentação de saída removida com sucesso' };
    }
}

module.exports = new SaidaService();
