const SaidaRepository = require('../repositories/SaidaRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const ProdutoRepository = require('../repositories/ProdutoRepository');
const EstoqueRepository = require('../repositories/EstoqueRepository');
const LoteRepository = require('../repositories/LoteRepository');

class SaidaService {
    async listarSaidas(filtros = {}) {
        const page = filtros.page !== undefined ? parseInt(filtros.page, 10) : null;
        const limit = filtros.limit !== undefined ? parseInt(filtros.limit, 10) : null;

        const saidas = await SaidaRepository.listarTodos(filtros);
        const total = saidas.total !== undefined ? saidas.total : saidas.length;

        const resposta = { sucesso: true, dados: saidas, total };

        if (page !== null || limit !== null) {
            const paginaAtual = page && page > 0 ? page : 1;
            const limiteAtual = limit && limit > 0 ? limit : (total || 10);

            resposta.pagina = paginaAtual;
            resposta.limite = limiteAtual;
            resposta.total_paginas = Math.ceil(total / limiteAtual) || 1;
        }

        return resposta;
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

        const {
            id_produto,
            data,
            id_lote,
            quantidade,
            motivo,
            rastreamento
        } = dados;

        if (!id_usuario) {
            throw {
                status: 400,
                mensagem: 'id_usuario é obrigatório'
            };
        }

        if (!id_produto || !data || !id_lote || quantidade == null) {
            throw {
                status: 400,
                mensagem: 'Campos obrigatórios faltando: id_produto, data, id_lote, quantidade'
            };
        }

        if (quantidade <= 0) {
            throw {
                status: 400,
                mensagem: 'A quantidade deve ser maior que zero'
            };
        }

        const usuario = await UsuarioRepository.buscarPorId(id_usuario);

        if (!usuario) {
            throw {
                status: 404,
                mensagem: 'Usuário informado não existe'
            };
        }

        const produto = await ProdutoRepository.buscarPorId(id_produto);

        if (!produto) {
            throw {
                status: 404,
                mensagem: 'Produto informado não existe'
            };
        }

        const lote = await LoteRepository.buscarPorId(id_lote);

        if (!lote) {
            throw {
                status: 404,
                mensagem: 'Lote informado não existe'
            };
        }

        if (lote.id_produto !== id_produto) {
            throw {
                status: 400,
                mensagem: 'O lote informado não pertence ao produto informado'
            };
        }

        if (lote.dt_validade) {
            const dataValidade = new Date(lote.dt_validade);

            dataValidade.setHours(23, 59, 59, 999);

            if (dataValidade < new Date()) {
                throw {
                    status: 400,
                    mensagem: 'Não é permitido registrar saída de lote vencido'
                };
            }
        }

        const estoque = await EstoqueRepository.buscarPorLote(id_lote);

        if (!estoque) {
            throw {
                status: 404,
                mensagem: 'Estoque não encontrado para o lote informado'
            };
        }

        if (estoque.qtd_atual < quantidade) {
            throw {
                status: 400,
                mensagem: `Estoque insuficiente. Disponível: ${estoque.qtd_atual}, solicitado: ${quantidade}`
            };
        }

        const novoId = await SaidaRepository.criar({
            id_usuario,
            id_produto,
            data,
            id_lote,
            quantidade,
            motivo: motivo ?? null,
            rastreamento: rastreamento ?? null
        });

        await EstoqueRepository.alterarQuantidade(
            estoque.id_estoque,
            -quantidade
        );

        const saidaCriada = await SaidaRepository.buscarPorId(novoId);

        return {
            sucesso: true,
            mensagem: 'Movimentação de saída cadastrada com sucesso',
            dados: saidaCriada
        };
    }

    async atualizarSaida(id, dados) {
        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: 'ID inválido'
            };
        }

        const saidaExiste = await SaidaRepository.buscarPorId(id);

        if (!saidaExiste) {
            throw {
                status: 404,
                mensagem: 'Movimentação de saída não encontrada'
            };
        }

        const {
            id_usuario,
            id_produto,
            data,
            id_lote,
            quantidade,
            motivo,
            rastreamento
        } = dados;

        const dadosAtualizados = {};

        if (id_usuario !== undefined) {
            throw {
                status: 400,
                mensagem: 'Não é permitido alterar o usuário de uma movimentação'
            };
        }

        if (id_produto !== undefined) {
            if (!await ProdutoRepository.buscarPorId(id_produto)) {
                throw {
                    status: 404,
                    mensagem: 'Produto informado não existe'
                };
            }

            dadosAtualizados.id_produto = id_produto;
        }

        if (id_lote !== undefined) {
            const lote = await LoteRepository.buscarPorId(id_lote);

            if (!lote) {
                throw {
                    status: 404,
                    mensagem: 'Lote informado não existe'
                };
            }

            const produtoParaValidar = id_produto ?? saidaExiste.id_produto;

            if (lote.id_produto !== produtoParaValidar) {
                throw {
                    status: 400,
                    mensagem: 'O lote informado não pertence ao produto informado'
                };
            }

            if (lote.dt_validade) {
                const dataValidade = new Date(lote.dt_validade);

                dataValidade.setHours(23, 59, 59, 999);

                if (dataValidade < new Date()) {
                    throw {
                        status: 400,
                        mensagem: 'Não é permitido registrar saída de lote vencido'
                    };
                }
            }

            dadosAtualizados.id_lote = id_lote;
        }

        if (data !== undefined) {
            dadosAtualizados.data = data;
        }

        if (quantidade !== undefined) {
            if (quantidade <= 0) {
                throw {
                    status: 400,
                    mensagem: 'A quantidade deve ser maior que zero'
                };
            }

            dadosAtualizados.quantidade = quantidade;
        }

        if (motivo !== undefined) {
            dadosAtualizados.motivo = motivo;
        }

        if (rastreamento !== undefined) {
            dadosAtualizados.rastreamento = rastreamento;
        }

        if (Object.keys(dadosAtualizados).length === 0) {
            throw {
                status: 400,
                mensagem: 'Nenhum campo para atualizar'
            };
        }

        // =========================
        // DADOS FINAIS
        // =========================

        const idLoteAntigo = saidaExiste.id_lote;
        const quantidadeAntiga = saidaExiste.quantidade;

        const idLoteNovo = id_lote ?? idLoteAntigo;
        const quantidadeNova = quantidade ?? quantidadeAntiga;

        // Se mudou o produto mas não mudou o lote,
        // verifica se o lote pertence ao novo produto.
        if (id_produto !== undefined && id_lote === undefined) {
            const loteExistente = await LoteRepository.buscarPorId(idLoteAntigo);

            if (
                loteExistente &&
                loteExistente.id_produto !== id_produto
            ) {
                throw {
                    status: 400,
                    mensagem: 'O lote atual não pertence ao novo produto informado. Informe também um novo id_lote.'
                };
            }
        }

        // =========================
        // AJUSTAR ESTOQUE
        // =========================

        const estoqueAntigo =
            await EstoqueRepository.buscarPorLote(idLoteAntigo);

        if (!estoqueAntigo) {
            throw {
                status: 404,
                mensagem: 'Estoque antigo não encontrado'
            };
        }

        if (idLoteNovo !== idLoteAntigo) {
            const estoqueNovo =
                await EstoqueRepository.buscarPorLote(idLoteNovo);

            if (!estoqueNovo) {
                throw {
                    status: 404,
                    mensagem: 'Estoque novo não encontrado para o lote informado'
                };
            }

            // Devolve ao estoque antigo
            await EstoqueRepository.alterarQuantidade(
                estoqueAntigo.id_estoque,
                quantidadeAntiga
            );

            // Verifica se existe quantidade suficiente no novo lote
            if (estoqueNovo.qtd_atual < quantidadeNova) {
                throw {
                    status: 400,
                    mensagem: `Estoque insuficiente no novo lote. Disponível: ${estoqueNovo.qtd_atual}, solicitado: ${quantidadeNova}`
                };
            }

            // Retira do novo lote
            await EstoqueRepository.alterarQuantidade(
                estoqueNovo.id_estoque,
                -quantidadeNova
            );

        } else if (quantidade !== undefined) {
            const diferenca = quantidadeNova - quantidadeAntiga;

            if (diferenca !== 0) {
                if (
                    diferenca > 0 &&
                    estoqueAntigo.qtd_atual < diferenca
                ) {
                    throw {
                        status: 400,
                        mensagem: `Estoque insuficiente. Disponível: ${estoqueAntigo.qtd_atual}, diferença necessária: ${diferenca}`
                    };
                }

                await EstoqueRepository.alterarQuantidade(
                    estoqueAntigo.id_estoque,
                    -diferenca
                );
            }
        }

        await SaidaRepository.atualizar(id, dadosAtualizados);

        const saidaAtualizada =
            await SaidaRepository.buscarPorId(id);

        return {
            sucesso: true,
            mensagem: 'Movimentação de saída atualizada com sucesso',
            dados: saidaAtualizada
        };
    }

    async removerSaida(id) {
        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: 'ID inválido'
            };
        }

        const saidaExiste =
            await SaidaRepository.buscarPorId(id);

        if (!saidaExiste) {
            throw {
                status: 404,
                mensagem: 'Movimentação de saída não encontrada'
            };
        }

        const estoque =
            await EstoqueRepository.buscarPorLote(saidaExiste.id_lote);

        if (!estoque) {
            throw {
                status: 404,
                mensagem: 'Estoque não encontrado para o lote da saída'
            };
        }

        // Primeiro devolve a quantidade retirada ao estoque.
        await EstoqueRepository.alterarQuantidade(
            estoque.id_estoque,
            Number(saidaExiste.quantidade)
        );

        // Depois remove o registro da saída.
        await SaidaRepository.remover(id);

        return {
            sucesso: true,
            mensagem: 'Movimentação de saída removida com sucesso'
        };
    }
}

module.exports = new SaidaService();