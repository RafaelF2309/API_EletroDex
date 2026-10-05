const SaidaRepository = require('../repositories/SaidaRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const FornecedorRepository = require('../repositories/FornecedorRepository');
const ProdutoRepository = require('../repositories/ProdutoRepository');
const EstoqueRepository = require('../repositories/EstoqueRepository');
const LoteRepository = require('../repositories/LoteRepository');

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

    async criarSaida(dados, id_usuario_autenticado) {
        const id_usuario = id_usuario_autenticado || dados.id_usuario;
        const { id_fornecedor, id_produto, data, id_lote, quantidade, rastreamento } = dados;

        if (!id_usuario) {
            throw {
                status: 400,
                mensagem: 'id_usuario é obrigatório'
            };
        }

        if (!id_fornecedor || !id_produto || !data || !id_lote || quantidade == null) {
            throw {
                status: 400,
                mensagem: 'Campos obrigatórios faltando: id_fornecedor, id_produto, data, id_lote, quantidade'
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

        const lote = await LoteRepository.buscarPorId(id_lote);
        if (!lote) {
            throw { status: 404, mensagem: 'Lote informado não existe' };
        }

        if (lote.id_produto !== id_produto) {
            throw {
                status: 400,
                mensagem: 'O lote informado não pertence ao produto informado'
            };
        }

        const estoque = await EstoqueRepository.buscarPorLote(id_lote);
        if (!estoque) {
            throw { status: 404, mensagem: 'Estoque não encontrado para o lote informado' };
        }

        if (estoque.qtd_atual < quantidade) {
            throw {
                status: 400,
                mensagem: `Estoque insuficiente. Disponível: ${estoque.qtd_atual}, solicitado: ${quantidade}`
            };
        }

        const novoId = await SaidaRepository.criar({
            id_usuario, id_fornecedor, id_produto, data, id_lote, quantidade, rastreamento: rastreamento ?? null
        });

        await EstoqueRepository.alterarQuantidade(estoque.id_estoque, -quantidade);

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

        const { id_usuario, id_fornecedor, id_produto, data, id_lote, quantidade, rastreamento } = dados;
        const dadosAtualizados = {};

        if (id_usuario !== undefined) {
            throw {
                status: 400,
                mensagem: 'Não é permitido alterar o usuário de uma movimentação'
            };
        }
        if (id_fornecedor !== undefined) {
            if (!await FornecedorRepository.buscarPorId(id_fornecedor)) {
                throw { status: 404, mensagem: 'Fornecedor informado não existe' };
            }
            dadosAtualizados.id_fornecedor = id_fornecedor;
        }
        if (id_produto !== undefined) {
            if (!await ProdutoRepository.buscarPorId(id_produto)) {
                throw { status: 404, mensagem: 'Produto informado não existe' };
            }
            dadosAtualizados.id_produto = id_produto;
        }

        if (id_lote !== undefined) {
            const lote = await LoteRepository.buscarPorId(id_lote);
            if (!lote) {
                throw { status: 404, mensagem: 'Lote informado não existe' };
            }

            const produtoParaValidar = id_produto ?? saidaExiste.id_produto;
            if (lote.id_produto !== produtoParaValidar) {
                throw {
                    status: 400,
                    mensagem: 'O lote informado não pertence ao produto informado'
                };
            }

            dadosAtualizados.id_lote = id_lote;
        }

        if (data !== undefined) dadosAtualizados.data = data;
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

        // =========================
        // DADOS FINAIS
        // =========================

        const idLoteAntigo = saidaExiste.id_lote;
        const quantidadeAntiga = saidaExiste.quantidade;

        const idLoteNovo = id_lote ?? idLoteAntigo;
        const quantidadeNova = quantidade ?? quantidadeAntiga;

        // Se mudou o produto mas não o lote, validar compatibilidade
        if (id_produto !== undefined && id_lote === undefined) {
            const loteExistente = await LoteRepository.buscarPorId(idLoteAntigo);
            if (loteExistente && loteExistente.id_produto !== id_produto) {
                throw {
                    status: 400,
                    mensagem: 'O lote atual não pertence ao novo produto informado. Informe também um novo id_lote.'
                };
            }
        }

        // =========================
        // AJUSTAR ESTOQUE
        // =========================

        const estoqueAntigo = await EstoqueRepository.buscarPorLote(idLoteAntigo);
        if (!estoqueAntigo) {
            throw { status: 404, mensagem: 'Estoque antigo não encontrado' };
        }

        if (idLoteNovo !== idLoteAntigo) {
            const estoqueNovo = await EstoqueRepository.buscarPorLote(idLoteNovo);
            if (!estoqueNovo) {
                throw { status: 404, mensagem: 'Estoque novo não encontrado para o lote informado' };
            }

            // Devolver ao estoque antigo
            await EstoqueRepository.alterarQuantidade(estoqueAntigo.id_estoque, quantidadeAntiga);

            // Retirar do estoque novo
            if (estoqueNovo.qtd_atual < quantidadeNova) {
                throw {
                    status: 400,
                    mensagem: `Estoque insuficiente no novo lote. Disponível: ${estoqueNovo.qtd_atual}, solicitado: ${quantidadeNova}`
                };
            }
            await EstoqueRepository.alterarQuantidade(estoqueNovo.id_estoque, -quantidadeNova);
        } else if (quantidade !== undefined) {
            const diferenca = quantidadeNova - quantidadeAntiga;
            if (diferenca !== 0) {
                if (diferenca > 0 && estoqueAntigo.qtd_atual < diferenca) {
                    throw {
                        status: 400,
                        mensagem: `Estoque insuficiente. Disponível: ${estoqueAntigo.qtd_atual}, diferença necessária: ${diferenca}`
                    };
                }
                await EstoqueRepository.alterarQuantidade(estoqueAntigo.id_estoque, -diferenca);
            }
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
