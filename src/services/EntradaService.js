const EntradaRepository = require("../repositories/EntradaRepository");
const UsuarioRepository = require("../repositories/UsuarioRepository");
const FornecedorRepository = require("../repositories/FornecedorRepository");
const ProdutoRepository = require("../repositories/ProdutoRepository");
const EstoqueRepository = require("../repositories/EstoqueRepository");

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

  async criarEntrada(dados) {
    const {
      id_usuario,
      id_fornecedor,
      id_produto,
      data,
      lote,
      quantidade,
      rastreamento,
    } = dados;

    if (
      !id_usuario ||
      !id_fornecedor ||
      !id_produto ||
      !data ||
      !lote ||
      quantidade == null
    ) {
      throw {
        status: 400,
        mensagem:
          "Campos obrigatórios faltando: id_usuario, id_fornecedor, id_produto, data, lote, quantidade",
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

    const estoque = await EstoqueRepository.buscarPorProdutoELote(
      id_produto,
      lote,
    );

    if (!estoque) {
      throw {
        status: 404,
        mensagem: "Estoque não encontrado para o produto e lote informados",
      };
    }

    const novoId = await EntradaRepository.criar({
      id_usuario,
      id_fornecedor,
      id_produto,
      data,
      lote,
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
      lote,
      quantidade,
      rastreamento,
    } = dados;

    const dadosAtualizados = {};

    // =========================
    // VALIDAR USUÁRIO
    // =========================

    if (id_usuario !== undefined) {
      const usuario = await UsuarioRepository.buscarPorId(id_usuario);

      if (!usuario) {
        throw {
          status: 404,
          mensagem: "Usuário informado não existe",
        };
      }

      dadosAtualizados.id_usuario = id_usuario;
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
    // OUTROS CAMPOS
    // =========================

    if (data !== undefined) {
      dadosAtualizados.data = data;
    }

    if (lote !== undefined) {
      dadosAtualizados.lote = lote;
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

    const produtoAntigo = entradaExiste.id_produto;
    const loteAntigo = entradaExiste.lote;
    const quantidadeAntiga = entradaExiste.quantidade;

    const produtoNovo = id_produto ?? produtoAntigo;
    const loteNovo = lote ?? loteAntigo;
    const quantidadeNova = quantidade ?? quantidadeAntiga;

    // =========================
    // VERIFICA SE O ESTOQUE ANTIGO EXISTE
    // =========================

    const estoqueAntigo = await EstoqueRepository.buscarPorProdutoELote(
      produtoAntigo,
      loteAntigo,
    );

    if (!estoqueAntigo) {
      throw {
        status: 404,
        mensagem: "Estoque antigo não encontrado",
      };
    }

    // =========================
    // PRODUTO OU LOTE MUDOU
    // =========================

    if (produtoNovo !== produtoAntigo || loteNovo !== loteAntigo) {
      const estoqueNovo = await EstoqueRepository.buscarPorProdutoELote(
        produtoNovo,
        loteNovo,
      );

      if (!estoqueNovo) {
        throw {
          status: 404,
          mensagem:
            "Estoque novo não encontrado para o produto e lote informados",
        };  
      }

      // Remove a quantidade da entrada antiga
      await EstoqueRepository.alterarQuantidade(
        estoqueAntigo.id_estoque,
        -quantidadeAntiga,
      );

      // Adiciona a quantidade no novo produto/lote
      await EstoqueRepository.alterarQuantidade(
        estoqueNovo.id_estoque,
        quantidadeNova,
      );
    }

    // =========================
    // MESMO PRODUTO E MESMO LOTE
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
