const FornecedorRepository = require('../repositories/FornecedorRepository');

class FornecedorService {
    async listarFornecedores() {
        const fornecedores = await FornecedorRepository.listarTodos();
        return { sucesso: true, dados: fornecedores, total: fornecedores.length };
    }

    async buscarFornecedorPorId(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const fornecedor = await FornecedorRepository.buscarPorId(id);

        if (!fornecedor) {
            throw { status: 404, mensagem: 'Fornecedor não encontrado' };
        }

        return { sucesso: true, dados: fornecedor };
    }

    async criarFornecedor(dados) {
        const { nome_fornecedor, email, telefone, cnpj } = dados;

        if (!nome_fornecedor || !email || !telefone || !cnpj) {
            throw { status: 400, mensagem: 'Campos obrigatórios faltando: nome_fornecedor, email, telefone, cnpj' };
        }

        const fornecedorExistente = await FornecedorRepository.buscarPorCnpj(cnpj);
        if (fornecedorExistente) {
            throw { status: 409, mensagem: 'Já existe um fornecedor cadastrado com este CNPJ' };
        }

        const novoId = await FornecedorRepository.criar({ nome_fornecedor, email, telefone, cnpj });
        const fornecedorCriado = await FornecedorRepository.buscarPorId(novoId);

        return { sucesso: true, mensagem: 'Fornecedor cadastrado com sucesso', dados: fornecedorCriado };
    }

    async atualizarFornecedor(id, dados) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const fornecedorExiste = await FornecedorRepository.buscarPorId(id);
        if (!fornecedorExiste) {
            throw { status: 404, mensagem: 'Fornecedor não encontrado' };
        }

        const { nome_fornecedor, email, telefone, cnpj } = dados;
        const dadosAtualizados = {};

        if (nome_fornecedor !== undefined) dadosAtualizados.nome_fornecedor = nome_fornecedor;
        if (email !== undefined) dadosAtualizados.email = email;
        if (telefone !== undefined) dadosAtualizados.telefone = telefone;
        if (cnpj !== undefined) dadosAtualizados.cnpj = cnpj;

        if (Object.keys(dadosAtualizados).length === 0) {
            throw { status: 400, mensagem: 'Nenhum campo para atualizar' };
        }

        await FornecedorRepository.atualizar(id, dadosAtualizados);
        const fornecedorAtualizado = await FornecedorRepository.buscarPorId(id);

        return { sucesso: true, mensagem: 'Fornecedor atualizado com sucesso', dados: fornecedorAtualizado };
    }

    async removerFornecedor(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const fornecedorExiste = await FornecedorRepository.buscarPorId(id);
        if (!fornecedorExiste) {
            throw { status: 404, mensagem: 'Fornecedor não encontrado' };
        }

        await FornecedorRepository.remover(id);
        return { sucesso: true, mensagem: 'Fornecedor removido com sucesso' };
    }
}

module.exports = new FornecedorService();
