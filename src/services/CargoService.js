const CargoRepository = require('../repositories/CargoRepository');
const pool = require('../config/database');

class CargoService {
    async listarCargos() {
        const dados = await CargoRepository.listarTodos();
        return { sucesso: true, dados, total: dados.length };
    }

    async buscarCargoPorId(id) {
        if (!id || isNaN(id)) throw { status: 400, mensagem: 'ID inválido' };
        const cargo = await CargoRepository.buscarPorId(id);
        if (!cargo) throw { status: 404, mensagem: 'Cargo não encontrado' };
        return { sucesso: true, dados: cargo };
    }

    async criarCargo(dados) {
        const nome = String(dados.nome_cargo || '').trim();
        const nivel = Number(dados.nivel_acesso ?? 1);
        if (!nome) throw { status: 400, mensagem: 'nome_cargo é obrigatório' };
        if (!Number.isInteger(nivel) || nivel < 1 || nivel > 3) throw { status: 400, mensagem: 'nivel_acesso deve ser um inteiro entre 1 e 3' };
        if (await CargoRepository.buscarPorNome(nome)) throw { status: 409, mensagem: 'Já existe um cargo com este nome' };
        const id = await CargoRepository.criar({ nome_cargo: nome, descricao: dados.descricao || null, nivel_acesso: nivel });
        return { sucesso: true, mensagem: 'Cargo cadastrado com sucesso', dados: await CargoRepository.buscarPorId(id) };
    }

    async atualizarCargo(id, dados) {
        if (!id || isNaN(id)) throw { status: 400, mensagem: 'ID inválido' };
        if (!await CargoRepository.buscarPorId(id)) throw { status: 404, mensagem: 'Cargo não encontrado' };
        const atualizacao = {};
        if (dados.nome_cargo !== undefined) {
            const nome = String(dados.nome_cargo).trim();
            if (!nome) throw { status: 400, mensagem: 'nome_cargo não pode ser vazio' };
            const outro = await CargoRepository.buscarPorNome(nome);
            if (outro && Number(outro.id_cargo) !== Number(id)) throw { status: 409, mensagem: 'Já existe um cargo com este nome' };
            atualizacao.nome_cargo = nome;
        }
        if (dados.descricao !== undefined) atualizacao.descricao = dados.descricao;
        if (dados.nivel_acesso !== undefined) {
            const nivel = Number(dados.nivel_acesso);
            if (!Number.isInteger(nivel) || nivel < 1 || nivel > 3) throw { status: 400, mensagem: 'nivel_acesso deve ser um inteiro entre 1 e 3' };
            atualizacao.nivel_acesso = nivel;
        }
        if (!Object.keys(atualizacao).length) throw { status: 400, mensagem: 'Nenhum campo para atualizar' };
        await CargoRepository.atualizar(id, atualizacao);
        return { sucesso: true, mensagem: 'Cargo atualizado com sucesso', dados: await CargoRepository.buscarPorId(id) };
    }

    async removerCargo(id) {
        if (!id || isNaN(id)) throw { status: 400, mensagem: 'ID inválido' };
        if (!await CargoRepository.buscarPorId(id)) throw { status: 404, mensagem: 'Cargo não encontrado' };
        const [usuarios] = await pool.query('SELECT COUNT(*) AS total FROM usuario WHERE id_cargo = ?', [id]);
        if (Number(usuarios[0].total) > 0) throw { status: 409, mensagem: 'Cargo está associado a usuários e não pode ser removido' };
        await CargoRepository.remover(id);
        return { sucesso: true, mensagem: 'Cargo removido com sucesso' };
    }
}

module.exports = new CargoService();
