const EntradaRepository = require("../repositories/EntradaRepository");
const UsuarioRepository = require("../repositories/UsuarioRepository");
const FornecedorRepository = require("../repositories/FornecedorRepository");
const ProdutoRepository = require("../repositories/ProdutoRepository");
const EstoqueRepository = require("../repositories/EstoqueRepository");
const LoteRepository = require("../repositories/LoteRepository");

class EntradaService {
  async listarEntradas() {
    const entradas = await EntradaRepository.listarTodos();
    return { sucesso: true, dados: entradas, total: entradas.length };
  }

  async buscarEntradaPorId(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: "ID inválido" };
    }

    const entrada = await EntradaRepository.buscarPorId(id);

    if (!entrada) {
      throw { status: 404, mensagem: "Movimentação de entrada não encontrada" };
    }

    return { sucesso: true, dados: entrada };
  }

  async criarEntrada(dados, id_usuario_autenticado) {
    const id_usuario = id_usuario_autenticado || dados.id_usuario;

    const {
      id_fornecedor,
      id_produto,
      data,
      id_lote,
      quantidade,
      rastreamento,
    } = dados;

    if (!id_usuario) {
      throw {
        status: 400,
        mensagem: "id_usuario é obrigatório",
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
          "Campos obrigatórios faltando: id_fornecedor, id_produto, data, id_lote, quantidade",
      };
    }

    if (
      typeof quantidade !== "number" ||
      !Number.isInteger(quantidade) ||
      quantidade <= 0
    ) {
      throw {
        status: 400,
        mensagem: "A quantidade deve ser um número inteiro maior que zero",
      };
    }

    const usuario = await UsuarioRepository.buscarPorId(id_usuario);
    if (!usuario) {
      throw { status: 404, mensagem: "Usuário informado não existe" };
    }

    const fornecedor = await FornecedorRepository.buscarPorId(id_fornecedor);
    if (!fornecedor) {
      throw { status: 404, mensagem: "Fornecedor informado não existe" };
    }

    const produto = await ProdutoRepository.buscarPorId(id_produto);
    if (!produto) {
      throw { status: 404, mensagem: "Produto informado não existe" };
    }

    const lote = await LoteRepository.buscarPorId(id_lote);
    if (!lote) {
      throw { status: 404, mensagem: "Lote informado não existe" };
    }

    if (lote.id_produto !== id_produto) {
      throw {
        status: 400,
        mensagem: "O lote informado não pertence ao produto informado",
      };
    }

    const estoque = await EstoqueRepository.buscarPorLote(id_lote);

    if (!estoque) {
      throw {
        status: 404,
        mensagem: "Estoque não encontrado para o lote informado",
      };
    }

    const novoId = await EntradaRepository.criar({
      id_usuario,
      id_fornecedor,
      id_produto,
      data,
      id_lote,
      quantidade,
      rastreamento: rastreamento ?? null,
    });

    await EstoqueRepository.alterarQuantidade(estoque.id_estoque, quantidade);

    const entradaCriada = await EntradaRepository.buscarPorId(novoId);

    return {
      sucesso: true,
      mensagem: "Movimentação de entrada cadastrada com sucesso",
      dados: entradaCriada,
    };
  }

  async atualizarEntrada(id, dados) {
    if (!id || isNaN(id)) {
      throw {
        status: 400,
        mensagem: "ID inválido",
      };
    }

    const entradaExiste = await EntradaRepository.buscarPorId(id);

    if (!entradaExiste) {
      throw {
        status: 404,
        mensagem: "Movimentação de entrada não encontrada",
      };
    }

    const {
      id_usuario,
      id_fornecedor,
      id_produto,
      data,
      id_lote,
      quantidade,
      rastreamento,
    } = dados;

    const dadosAtualizados = {};

    // =========================
    // VALIDAR USUÁRIO (NÃO PERMITIR ALTERAÇÃO)
    // =========================

    if (id_usuario !== undefined) {
      throw {
        status: 400,
        mensagem: "Não é permitido alterar o usuário de uma movimentação",
      };
    }

    // =========================
    // VALIDAR FORNECEDOR
    // =========================

    if (id_fornecedor !== undefined) {
      const fornecedor = await FornecedorRepository.buscarPorId(id_fornecedor);

      if (!fornecedor) {
        throw {
          status: 404,
          mensagem: "Fornecedor informado não existe",
        };
      }

      dadosAtualizados.id_fornecedor = id_fornecedor;
    }

    // =========================
    // VALIDAR PRODUTO
    // =========================

    if (id_produto !== undefined) {
      const produto = await ProdutoRepository.buscarPorId(id_produto);

      if (!produto) {
        throw {
          status: 404,
          mensagem: "Produto informado não existe",
        };
      }

      dadosAtualizados.id_produto = id_produto;
    }

    // =========================
    // VALIDAR LOTE
    // =========================

    if (id_lote !== undefined) {
      const lote = await LoteRepository.buscarPorId(id_lote);

      if (!lote) {
        throw {
          status: 404,
          mensagem: "Lote informado não existe",
        };
      }

      // Validar que o lote pertence ao produto (novo ou existente)
      const produtoParaValidar = id_produto ?? entradaExiste.id_produto;
      if (lote.id_produto !== produtoParaValidar) {
        throw {
          status: 400,
          mensagem: "O lote informado não pertence ao produto informado",
        };
      }

      dadosAtualizados.id_lote = id_lote;
    }

    // =========================
    // OUTROS CAMPOS
    // =========================

    if (data !== undefined) {
      dadosAtualizados.data = data;
    }

    if (quantidade !== undefined) {
      if (!Number.isInteger(quantidade) || quantidade <= 0) {
        throw {
          status: 400,
          mensagem: "A quantidade deve ser um número inteiro maior que zero",
        };
      }

      dadosAtualizados.quantidade = quantidade;
    }

    if (rastreamento !== undefined) {
      dadosAtualizados.rastreamento = rastreamento;
    }

    if (Object.keys(dadosAtualizados).length === 0) {
      throw {
        status: 400,
        mensagem: "Nenhum campo para atualizar",
      };
    }

    // =========================
    // DADOS FINAIS
    // =========================

    const idLoteAntigo = entradaExiste.id_lote;
    const quantidadeAntiga = entradaExiste.quantidade;

    const idLoteNovo = id_lote ?? idLoteAntigo;
    const quantidadeNova = quantidade ?? quantidadeAntiga;

    // Se mudou o produto mas não o lote, validar que o lote novo pertence ao produto novo
    if (id_produto !== undefined && id_lote === undefined) {
      const loteExistente = await LoteRepository.buscarPorId(idLoteAntigo);
      if (loteExistente && loteExistente.id_produto !== id_produto) {
        throw {
          status: 400,
          mensagem: "O lote atual não pertence ao novo produto informado. Informe também um novo id_lote.",
        };
      }
    }

    // =========================
    // VERIFICA SE O ESTOQUE ANTIGO EXISTE
    // =========================

    const estoqueAntigo = await EstoqueRepository.buscarPorLote(idLoteAntigo);

    if (!estoqueAntigo) {
      throw {
        status: 404,
        mensagem: "Estoque antigo não encontrado",
      };
    }

    // =========================
    // LOTE MUDOU
    // =========================

    if (idLoteNovo !== idLoteAntigo) {
      const estoqueNovo = await EstoqueRepository.buscarPorLote(idLoteNovo);

      if (!estoqueNovo) {
        throw {
          status: 404,
          mensagem:
            "Estoque novo não encontrado para o lote informado",
        };
      }

      // Remove a quantidade da entrada antiga
      await EstoqueRepository.alterarQuantidade(
        estoqueAntigo.id_estoque,
        -quantidadeAntiga,
      );

      // Adiciona a quantidade no novo lote
      await EstoqueRepository.alterarQuantidade(
        estoqueNovo.id_estoque,
        quantidadeNova,
      );
    }

    // =========================
    // MESMO LOTE
    // =========================
    else if (quantidade !== undefined) {
      const diferenca = quantidadeNova - quantidadeAntiga;

      if (diferenca !== 0) {
        await EstoqueRepository.alterarQuantidade(
          estoqueAntigo.id_estoque,
          diferenca,
        );
      }
    }

    // =========================
    // ATUALIZA A ENTRADA
    // =========================

    await EntradaRepository.atualizar(id, dadosAtualizados);

    const entradaAtualizada = await EntradaRepository.buscarPorId(id);

    return {
      sucesso: true,
      mensagem: "Movimentação de entrada atualizada com sucesso",
      dados: entradaAtualizada,
    };
  }

  async removerEntrada(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: "ID inválido" };
    }

    const entradaExiste = await EntradaRepository.buscarPorId(id);
    if (!entradaExiste) {
      throw { status: 404, mensagem: "Movimentação de entrada não encontrada" };
    }

    await EntradaRepository.remover(id);
    return {
      sucesso: true,
      mensagem: "Movimentação de entrada removida com sucesso",
    };
  }
}

module.exports = new EntradaService();
