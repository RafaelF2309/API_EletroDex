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

        // Normaliza CNPJ (apenas dígitos) e valida formato
        const cnpjDigits = String(cnpj).replace(/\D/g, '');
        if (cnpjDigits.length !== 14) {
            throw { status: 400, mensagem: 'CNPJ inválido. Deve conter 14 dígitos numéricos.' };
        }
        // Validação simples de e‑mail
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRegex.test(email)) {
            throw { status: 400, mensagem: 'E‑mail inválido.' };
        }
        const fornecedorExistente = await FornecedorRepository.buscarPorCnpj(cnpjDigits);
        if (fornecedorExistente) {
            throw { status: 409, mensagem: 'Já existe um fornecedor cadastrado com este CNPJ' };
        }
        const novoId = await FornecedorRepository.criar({ nome_fornecedor, email, telefone, cnpj: cnpjDigits });
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

        if (email !== undefined) {
            const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
            if (!emailRegex.test(email)) {
                throw { status: 400, mensagem: 'E-mail inválido.' };
            }
            dadosAtualizados.email = email;
        }

        if (telefone !== undefined) dadosAtualizados.telefone = telefone;

        if (cnpj !== undefined) {
            // Normaliza CNPJ (apenas dígitos) e valida formato
            const cnpjDigits = String(cnpj).replace(/\D/g, '');
            if (cnpjDigits.length !== 14) {
                throw { status: 400, mensagem: 'CNPJ inválido. Deve conter 14 dígitos numéricos.' };
            }
            // Verifica se outro fornecedor já possui este CNPJ
            const fornecedorComCnpj = await FornecedorRepository.buscarPorCnpj(cnpjDigits);
            if (fornecedorComCnpj && Number(fornecedorComCnpj.id_fornecedor) !== Number(id)) {
                throw { status: 409, mensagem: 'Outro fornecedor já possui este CNPJ.' };
            }
            dadosAtualizados.cnpj = cnpjDigits;
        }

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

        const dependencias = await FornecedorRepository.contarDependencias(id);
        if (dependencias > 0) {
            throw {
                status: 409,
                mensagem: 'Fornecedor possui lotes ou movimentações vinculadas e não pode ser removido'
            };
        }

        await FornecedorRepository.remover(id);
        return { sucesso: true, mensagem: 'Fornecedor removido com sucesso' };
    }
}

module.exports = new FornecedorService();
