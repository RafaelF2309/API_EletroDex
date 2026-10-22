const EntradaRepository = require("../repositories/EntradaRepository");
const UsuarioRepository = require("../repositories/UsuarioRepository");
const FornecedorRepository = require("../repositories/FornecedorRepository");
const ProdutoRepository = require("../repositories/ProdutoRepository");
const EstoqueRepository = require("../repositories/EstoqueRepository");
const LoteRepository = require("../repositories/LoteRepository");

class EntradaService {

    async listarEntradas(filtros = {}) {

        const page =
            filtros.page !== undefined
                ? parseInt(filtros.page, 10)
                : null;

        const limit =
            filtros.limit !== undefined
                ? parseInt(filtros.limit, 10)
                : null;

        const entradas =
            await EntradaRepository.listarTodos(filtros);

        const total =
            entradas.total !== undefined
                ? entradas.total
                : entradas.length;

        const resposta = {
            sucesso: true,
            dados: entradas,
            total
        };

        if (page !== null || limit !== null) {

            const paginaAtual =
                page && page > 0
                    ? page
                    : 1;

            const limiteAtual =
                limit && limit > 0
                    ? limit
                    : (total || 10);

            resposta.pagina = paginaAtual;
            resposta.limite = limiteAtual;
            resposta.total_paginas =
                Math.ceil(
                    total / limiteAtual
                ) || 1;
        }

        return resposta;
    }

    async buscarEntradaPorId(id) {

        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: "ID inválido"
            };
        }

        const entrada =
            await EntradaRepository.buscarPorId(id);

        if (!entrada) {
            throw {
                status: 404,
                mensagem:
                    "Movimentação de entrada não encontrada"
            };
        }

        return {
            sucesso: true,
            dados: entrada
        };
    }

    async criarEntrada(
        dados,
        id_usuario_autenticado
    ) {

        const id_usuario =
            id_usuario_autenticado ||
            dados.id_usuario;

        const {
            id_fornecedor,
            id_produto,
            data,
            id_lote,
            quantidade,
            rastreamento
        } = dados;

        if (!id_usuario) {
            throw {
                status: 400,
                mensagem: "id_usuario é obrigatório"
            };
        }

        if (
            !id_fornecedor ||
            !id_produto ||
            !data ||
            !id_lote ||
            quantidade == null
        ) {
            throw {
                status: 400,
                mensagem:
                    "Campos obrigatórios faltando: id_fornecedor, id_produto, data, id_lote, quantidade"
            };
        }

        if (
            typeof quantidade !== "number" ||
            !Number.isInteger(quantidade) ||
            quantidade <= 0
        ) {
            throw {
                status: 400,
                mensagem:
                    "A quantidade deve ser um número inteiro maior que zero"
            };
        }

        const usuario =
            await UsuarioRepository.buscarPorId(
                id_usuario
            );

        if (!usuario) {
            throw {
                status: 404,
                mensagem:
                    "Usuário informado não existe"
            };
        }

        const fornecedor =
            await FornecedorRepository.buscarPorId(
                id_fornecedor
            );

        if (!fornecedor) {
            throw {
                status: 404,
                mensagem:
                    "Fornecedor informado não existe"
            };
        }

        const produto =
            await ProdutoRepository.buscarPorId(
                id_produto
            );

        if (!produto) {
            throw {
                status: 404,
                mensagem:
                    "Produto informado não existe"
            };
        }

        const lote =
            await LoteRepository.buscarPorId(
                id_lote
            );

        if (!lote) {
            throw {
                status: 404,
                mensagem:
                    "Lote informado não existe"
            };
        }

        if (lote.id_produto !== id_produto) {
            throw {
                status: 400,
                mensagem:
                    "O lote informado não pertence ao produto informado"
            };
        }

        const estoque =
            await EstoqueRepository.buscarPorLote(
                id_lote
            );

        if (!estoque) {
            throw {
                status: 404,
                mensagem:
                    "Estoque não encontrado para o lote informado"
            };
        }

        const novoId =
            await EntradaRepository.criar({
                id_usuario,
                id_fornecedor,
                id_produto,
                data,
                id_lote,
                quantidade,
                rastreamento:
                    rastreamento ?? null
            });

        await EstoqueRepository.alterarQuantidade(
            estoque.id_estoque,
            quantidade
        );

        const entradaCriada =
            await EntradaRepository.buscarPorId(
                novoId
            );

        return {
            sucesso: true,
            mensagem:
                "Movimentação de entrada cadastrada com sucesso",
            dados: entradaCriada
        };
    }

    async atualizarEntrada(id, dados) {

        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: "ID inválido"
            };
        }

        const entradaExiste =
            await EntradaRepository.buscarPorId(id);

        if (!entradaExiste) {
            throw {
                status: 404,
                mensagem:
                    "Movimentação de entrada não encontrada"
            };
        }

        const {
            id_usuario,
            id_fornecedor,
            id_produto,
            data,
            id_lote,
            quantidade,
            rastreamento
        } = dados;

        const dadosAtualizados = {};

        if (id_usuario !== undefined) {
            throw {
                status: 400,
                mensagem:
                    "Não é permitido alterar o usuário de uma movimentação"
            };
        }

        if (id_fornecedor !== undefined) {

            const fornecedor =
                await FornecedorRepository.buscarPorId(
                    id_fornecedor
                );

            if (!fornecedor) {
                throw {
                    status: 404,
                    mensagem:
                        "Fornecedor informado não existe"
                };
            }

            dadosAtualizados.id_fornecedor =
                id_fornecedor;
        }

        if (id_produto !== undefined) {

            const produto =
                await ProdutoRepository.buscarPorId(
                    id_produto
                );

            if (!produto) {
                throw {
                    status: 404,
                    mensagem:
                        "Produto informado não existe"
                };
            }

            dadosAtualizados.id_produto =
                id_produto;
        }

        if (id_lote !== undefined) {

            const lote =
                await LoteRepository.buscarPorId(
                    id_lote
                );

            if (!lote) {
                throw {
                    status: 404,
                    mensagem:
                        "Lote informado não existe"
                };
            }

            const produtoParaValidar =
                id_produto ??
                entradaExiste.id_produto;

            if (
                lote.id_produto !==
                produtoParaValidar
            ) {
                throw {
                    status: 400,
                    mensagem:
                        "O lote informado não pertence ao produto informado"
                };
            }

            dadosAtualizados.id_lote =
                id_lote;
        }

        if (data !== undefined) {
            dadosAtualizados.data = data;
        }

        if (quantidade !== undefined) {

            if (
                !Number.isInteger(quantidade) ||
                quantidade <= 0
            ) {
                throw {
                    status: 400,
                    mensagem:
                        "A quantidade deve ser um número inteiro maior que zero"
                };
            }

            dadosAtualizados.quantidade =
                quantidade;
        }

        if (rastreamento !== undefined) {
            dadosAtualizados.rastreamento =
                rastreamento;
        }

        if (
            Object.keys(dadosAtualizados).length === 0
        ) {
            throw {
                status: 400,
                mensagem:
                    "Nenhum campo para atualizar"
            };
        }

        const idLoteAntigo =
            entradaExiste.id_lote;

        const quantidadeAntiga =
            Number(entradaExiste.quantidade);

        const idLoteNovo =
            id_lote ?? idLoteAntigo;

        const quantidadeNova =
            quantidade ?? quantidadeAntiga;

        if (
            id_produto !== undefined &&
            id_lote === undefined
        ) {

            const loteExistente =
                await LoteRepository.buscarPorId(
                    idLoteAntigo
                );

            if (
                loteExistente &&
                loteExistente.id_produto !==
                    id_produto
            ) {
                throw {
                    status: 400,
                    mensagem:
                        "O lote atual não pertence ao novo produto informado. Informe também um novo id_lote."
                };
            }
        }

        const estoqueAntigo =
            await EstoqueRepository.buscarPorLote(
                idLoteAntigo
            );

        if (!estoqueAntigo) {
            throw {
                status: 404,
                mensagem:
                    "Estoque antigo não encontrado"
            };
        }

        if (idLoteNovo !== idLoteAntigo) {

            const estoqueNovo =
                await EstoqueRepository.buscarPorLote(
                    idLoteNovo
                );

            if (!estoqueNovo) {
                throw {
                    status: 404,
                    mensagem:
                        "Estoque novo não encontrado para o lote informado"
                };
            }

            await EstoqueRepository.alterarQuantidade(
                estoqueAntigo.id_estoque,
                -quantidadeAntiga
            );

            await EstoqueRepository.alterarQuantidade(
                estoqueNovo.id_estoque,
                quantidadeNova
            );

        } else if (quantidade !== undefined) {

            const diferenca =
                Number(quantidadeNova) -
                quantidadeAntiga;

            if (diferenca !== 0) {

                await EstoqueRepository.alterarQuantidade(
                    estoqueAntigo.id_estoque,
                    diferenca
                );
            }
        }

        await EntradaRepository.atualizar(
            id,
            dadosAtualizados
        );

        const entradaAtualizada =
            await EntradaRepository.buscarPorId(id);

        return {
            sucesso: true,
            mensagem:
                "Movimentação de entrada atualizada com sucesso",
            dados: entradaAtualizada
        };
    }

    async removerEntrada(id) {

        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: "ID inválido"
            };
        }

        const entradaExiste =
            await EntradaRepository.buscarPorId(id);

        if (!entradaExiste) {
            throw {
                status: 404,
                mensagem:
                    "Movimentação de entrada não encontrada"
            };
        }

        const estoque =
            await EstoqueRepository.buscarPorLote(
                entradaExiste.id_lote
            );

        if (!estoque) {
            throw {
                status: 404,
                mensagem:
                    "Estoque não encontrado para o lote da entrada"
            };
        }

        const quantidade =
            Number(entradaExiste.quantidade);

        if (Number(estoque.qtd_atual) < quantidade) {
            throw {
                status: 400,
                mensagem:
                    `Não é possível remover a entrada porque o estoque atual (${estoque.qtd_atual}) é menor que a quantidade da entrada (${quantidade})`
            };
        }

        // Estorna a quantidade que havia entrado.
        await EstoqueRepository.alterarQuantidade(
            estoque.id_estoque,
            -quantidade
        );

        // Remove o registro da entrada.
        await EntradaRepository.remover(id);

        return {
            sucesso: true,
            mensagem:
                "Movimentação de entrada removida com sucesso"
        };
    }
}

module.exports = new EntradaService();