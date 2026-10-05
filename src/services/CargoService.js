const CargoRepository = require('../repositories/CargoRepository');
const pool = require('../config/database');

class CargoService {

    async listarCargos() {

        const cargos =
            await CargoRepository.listarTodos();

        return {
            sucesso: true,
            dados: cargos,
            total: cargos.length
        };
    }

    async buscarCargoPorId(id) {

        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: 'ID inválido'
            };
        }

        const cargo =
            await CargoRepository.buscarPorId(id);

        if (!cargo) {
            throw {
                status: 404,
                mensagem: 'Cargo não encontrado'
            };
        }

        return {
            sucesso: true,
            dados: cargo
        };
    }

    async criarCargo(dados) {

        const {
            nome_cargo,
            descricao,
            nivel_acesso
        } = dados;

        // Nome obrigatório
        if (
            !nome_cargo ||
            String(nome_cargo).trim() === ''
        ) {
            throw {
                status: 400,
                mensagem: 'Campos obrigatórios faltando: nome_cargo'
            };
        }

        const nomeFormatado =
            String(nome_cargo).trim();

        // Verificar duplicidade
        const cargoExistente =
            await CargoRepository.buscarPorNome(
                nomeFormatado
            );

        if (cargoExistente) {
            throw {
                status: 409,
                mensagem: 'Já existe um cargo cadastrado com este nome'
            };
        }

        // Nível padrão
        let nivelNumerico = 1;

        if (
            nivel_acesso !== undefined &&
            nivel_acesso !== null
        ) {

            nivelNumerico = Number(nivel_acesso);

            if (
                isNaN(nivelNumerico) ||
                !Number.isInteger(nivelNumerico) ||
                nivelNumerico < 1 ||
                nivelNumerico > 3
            ) {
                throw {
                    status: 400,
                    mensagem: 'Nível de acesso deve ser um número inteiro entre 1 e 3'
                };
            }
        }

        const novoCargo = {
            nome_cargo: nomeFormatado,
            descricao: descricao
                ? String(descricao).trim()
                : null,
            nivel_acesso: nivelNumerico
        };

        const novoId =
            await CargoRepository.criar(
                novoCargo
            );

        const cargoCriado =
            await CargoRepository.buscarPorId(
                novoId
            );

        return {
            sucesso: true,
            mensagem: 'Cargo cadastrado com sucesso',
            dados: cargoCriado
        };
    }

    async atualizarCargo(id, dados) {

        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: 'ID inválido'
            };
        }

        const cargoExiste =
            await CargoRepository.buscarPorId(id);

        if (!cargoExiste) {
            throw {
                status: 404,
                mensagem: 'Cargo não encontrado'
            };
        }

        const {
            nome_cargo,
            descricao,
            nivel_acesso
        } = dados;

        const dadosAtualizados = {};

        // Nome
        if (
            nome_cargo !== undefined &&
            nome_cargo !== null
        ) {

            const nomeFormatado =
                String(nome_cargo).trim();

            if (nomeFormatado === '') {
                throw {
                    status: 400,
                    mensagem: 'O nome do cargo não pode ser vazio'
                };
            }

            if (
                nomeFormatado.toLowerCase() !==
                String(cargoExiste.nome_cargo).toLowerCase()
            ) {

                const outroCargo =
                    await CargoRepository.buscarPorNome(
                        nomeFormatado
                    );

                if (outroCargo && Number(outroCargo.id_cargo) !== Number(id)) {
                    throw {
                        status: 409,
                        mensagem: 'Já existe outro cargo cadastrado com este nome'
                    };
                }
            }

            dadosAtualizados.nome_cargo =
                nomeFormatado;
        }

        // Descrição
        if (
            descricao !== undefined &&
            descricao !== null
        ) {
            dadosAtualizados.descricao =
                String(descricao).trim();
        }

        // Nível de acesso
        if (
            nivel_acesso !== undefined &&
            nivel_acesso !== null
        ) {

            const nivelNumerico =
                Number(nivel_acesso);

            if (
                isNaN(nivelNumerico) ||
                !Number.isInteger(nivelNumerico) ||
                nivelNumerico < 1 ||
                nivelNumerico > 3
            ) {
                throw {
                    status: 400,
                    mensagem: 'Nível de acesso deve ser um número inteiro entre 1 e 3'
                };
            }

            dadosAtualizados.nivel_acesso =
                nivelNumerico;
        }

        // Nenhuma alteração
        if (
            Object.keys(dadosAtualizados).length === 0
        ) {
            throw {
                status: 400,
                mensagem: 'Nenhum campo para atualizar'
            };
        }

        await CargoRepository.atualizar(
            id,
            dadosAtualizados
        );

        const cargoAtualizado =
            await CargoRepository.buscarPorId(id);

        return {
            sucesso: true,
            mensagem: 'Cargo atualizado com sucesso',
            dados: cargoAtualizado
        };
    }

    async removerCargo(id) {

        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: 'ID inválido'
            };
        }

        const cargoExiste =
            await CargoRepository.buscarPorId(id);

        if (!cargoExiste) {
            throw {
                status: 404,
                mensagem: 'Cargo não encontrado'
            };
        }

        const [usuariosVinculados] =
            await pool.query(
                'SELECT COUNT(*) AS total FROM usuario WHERE id_cargo = ?',
                [id]
            );

        if (
            Number(usuariosVinculados[0].total) > 0
        ) {
            throw {
                status: 409,
                mensagem: 'Cargo está vinculado a um ou mais usuários e não pode ser removido'
            };
        }

        await CargoRepository.remover(id);

        return {
            sucesso: true,
            mensagem: 'Cargo removido com sucesso'
        };
    }
}
    
module.exports = new CargoService();