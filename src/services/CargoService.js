const CargoRepository = require('../repositories/CargoRepository');
const pool = require('../config/database');

class CargoService {
    async listarCargos() {
<<<<<<< HEAD
        const cargos = await CargoRepository.listarTodos();
        return { sucesso: true, dados: cargos, total: cargos.length };
    }

    async buscarCargoPorId(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const cargo = await CargoRepository.buscarPorId(id);

        if (!cargo) {
            throw { status: 404, mensagem: 'Cargo não encontrado' };
        }

=======
        const dados = await CargoRepository.listarTodos();
        return { sucesso: true, dados, total: dados.length };
    }

    async buscarCargoPorId(id) {
        if (!id || isNaN(id)) throw { status: 400, mensagem: 'ID inválido' };
        const cargo = await CargoRepository.buscarPorId(id);
        if (!cargo) throw { status: 404, mensagem: 'Cargo não encontrado' };
>>>>>>> 6336b4dfb45c281e5aea49faff9ab12de2caf7bb
        return { sucesso: true, dados: cargo };
    }

    async criarCargo(dados) {
<<<<<<< HEAD
        const { nome_cargo, descricao, nivel_acesso } = dados;

        if (!nome_cargo || String(nome_cargo).trim() === '') {
            throw { status: 400, mensagem: 'Campos obrigatórios faltando: nome_cargo' };
        }

        const nomeFormatado = String(nome_cargo).trim();

        const cargoExistente = await CargoRepository.buscarPorNome(nomeFormatado);
        if (cargoExistente) {
            throw { status: 409, mensagem: 'Já existe um cargo cadastrado com este nome' };
        }

        let nivelNumerico = 1;
        if (nivel_acesso !== undefined && nivel_acesso !== null) {
            nivelNumerico = Number(nivel_acesso);
            if (isNaN(nivelNumerico) || !Number.isInteger(nivelNumerico) || nivelNumerico < 1) {
                throw { status: 400, mensagem: 'Nível de acesso deve ser um número inteiro maior ou igual a 1' };
            }
        }

        const novoCargo = {
            nome_cargo: nomeFormatado,
            descricao: descricao ? String(descricao).trim() : null,
            nivel_acesso: nivelNumerico
        };

        const novoId = await CargoRepository.criar(novoCargo);
        const cargoCriado = await CargoRepository.buscarPorId(novoId);

        return { sucesso: true, mensagem: 'Cargo cadastrado com sucesso', dados: cargoCriado };
    }

    async atualizarCargo(id, dados) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const cargoExiste = await CargoRepository.buscarPorId(id);
        if (!cargoExiste) {
            throw { status: 404, mensagem: 'Cargo não encontrado' };
        }

        const { nome_cargo, descricao, nivel_acesso } = dados;
        const dadosAtualizados = {};

        if (nome_cargo !== undefined && nome_cargo !== null) {
            const nomeFormatado = String(nome_cargo).trim();
            if (nomeFormatado === '') {
                throw { status: 400, mensagem: 'O nome do cargo não pode ser vazio' };
            }

            if (nomeFormatado.toLowerCase() !== cargoExiste.nome_cargo.toLowerCase()) {
                const outroCargo = await CargoRepository.buscarPorNome(nomeFormatado);
                if (outroCargo) {
                    throw { status: 409, mensagem: 'Já existe outro cargo cadastrado com este nome' };
                }
            }
            dadosAtualizados.nome_cargo = nomeFormatado;
        }

        if (descricao !== undefined && descricao !== null) {
            dadosAtualizados.descricao = String(descricao).trim();
        }

        if (nivel_acesso !== undefined && nivel_acesso !== null) {
            const nivelNumerico = Number(nivel_acesso);
            if (isNaN(nivelNumerico) || !Number.isInteger(nivelNumerico) || nivelNumerico < 1) {
                throw { status: 400, mensagem: 'Nível de acesso deve ser um número inteiro maior ou igual a 1' };
            }
            dadosAtualizados.nivel_acesso = nivelNumerico;
        }

        if (Object.keys(dadosAtualizados).length === 0) {
            throw { status: 400, mensagem: 'Nenhum campo para atualizar' };
        }

        await CargoRepository.atualizar(id, dadosAtualizados);
        const cargoAtualizado = await CargoRepository.buscarPorId(id);

        return { sucesso: true, mensagem: 'Cargo atualizado com sucesso', dados: cargoAtualizado };
    }

    async removerCargo(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const cargoExiste = await CargoRepository.buscarPorId(id);
        if (!cargoExiste) {
            throw { status: 404, mensagem: 'Cargo não encontrado' };
        }

        const [usuariosVinculados] = await pool.query(
            'SELECT COUNT(*) AS total FROM usuario WHERE id_cargo = ?',
            [id]
        );

        if (usuariosVinculados[0].total > 0) {
            throw { status: 409, mensagem: 'Cargo está vinculado a um ou mais usuários e não pode ser removido' };
        }

=======
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
>>>>>>> 6336b4dfb45c281e5aea49faff9ab12de2caf7bb
        await CargoRepository.remover(id);
        return { sucesso: true, mensagem: 'Cargo removido com sucesso' };
    }
}

module.exports = new CargoService();
