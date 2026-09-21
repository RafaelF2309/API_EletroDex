const bcrypt = require('bcrypt');
const UsuarioRepository = require('../repositories/UsuarioRepository');

class UsuarioService {

    async listarUsuarios() {
        const usuarios = await UsuarioRepository.listarTodos();

        return {
            sucesso: true,
            dados: usuarios,
            total: usuarios.length
        };
    }

    async buscarUsuarioPorId(id) {
        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: 'ID inválido'
            };
        }

        const usuario = await UsuarioRepository.buscarPorId(id);

        if (!usuario) {
            throw {
                status: 404,
                mensagem: 'Usuário não encontrado'
            };
        }

        return {
            sucesso: true,
            dados: usuario
        };
    }

    async criarUsuario(dados) {

        const {
            nome,
            email,
            senha,
            setor,
            id_cargo,
            foto_perfil
        } = dados;

        // Verificar campos obrigatórios
        if (!nome || !email || !senha || !setor || !id_cargo) {
            throw {
                status: 400,
                mensagem: 'Campos obrigatórios faltando: nome, email, senha, setor e id_cargo'
            };
        }

        // Verificar se o cargo é válido
        if (isNaN(id_cargo)) {
            throw {
                status: 400,
                mensagem: 'id_cargo inválido'
            };
        }

        const cargoExiste = await UsuarioRepository.buscarCargoPorId(Number(id_cargo));
        if (!cargoExiste) {
            throw {
                status: 404,
                mensagem: 'Cargo informado não existe'
            };
        }

        // Normalizar e-mail
        const emailFormatado = String(email)
            .trim()
            .toLowerCase();

        // Verificar se já existe usuário com esse e-mail
        const usuarioExistente =
            await UsuarioRepository.buscarPorEmail(emailFormatado);

        if (usuarioExistente) {
            throw {
                status: 409,
                mensagem: 'Já existe um usuário cadastrado com este e-mail'
            };
        }

        // Hash da senha
        const saltRounds = 10;

        const senhaHash = await bcrypt.hash(
            String(senha),
            saltRounds
        );

        // Criar usuário
        const novoId = await UsuarioRepository.criar({
            nome: String(nome).trim(),
            email: emailFormatado,
            senha: senhaHash,
            setor: String(setor).trim(),
            id_cargo: Number(id_cargo),
            foto_perfil: foto_perfil || null
        });

        // Buscar usuário criado
        const usuarioCriado =
            await UsuarioRepository.buscarPorId(novoId);

        return {
            sucesso: true,
            mensagem: 'Usuário cadastrado com sucesso',
            dados: usuarioCriado
        };
    }

    async atualizarUsuario(id, dados) {

        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: 'ID inválido'
            };
        }

        const usuarioExiste =
            await UsuarioRepository.buscarPorId(id);

        if (!usuarioExiste) {
            throw {
                status: 404,
                mensagem: 'Usuário não encontrado'
            };
        }

        const {
            nome,
            email,
            senha,
            setor,
            id_cargo,
            foto_perfil
        } = dados;

        const dadosAtualizados = {};

        // Nome
        if (nome !== undefined && nome !== null) {

            const nomeFormatado = String(nome).trim();

            if (nomeFormatado === '') {
                throw {
                    status: 400,
                    mensagem: 'O nome não pode ser vazio'
                };
            }

            dadosAtualizados.nome = nomeFormatado;
        }

        // E-mail
        if (email !== undefined && email !== null) {

            const emailFormatado = String(email)
                .trim()
                .toLowerCase();

            if (emailFormatado === '') {
                throw {
                    status: 400,
                    mensagem: 'O e-mail não pode ser vazio'
                };
            }

            if (emailFormatado !== usuarioExiste.email) {

                const outroUsuario =
                    await UsuarioRepository.buscarPorEmail(
                        emailFormatado
                    );

                if (outroUsuario) {
                    throw {
                        status: 409,
                        mensagem: 'Já existe outro usuário cadastrado com este e-mail'
                    };
                }
            }

            dadosAtualizados.email = emailFormatado;
        }

        // Senha
        if (
            senha !== undefined &&
            senha !== null &&
            String(senha).trim() !== ''
        ) {

            dadosAtualizados.senha =
                await bcrypt.hash(
                    String(senha),
                    10
                );
        }

        // Setor
        if (setor !== undefined && setor !== null) {

            const setorFormatado = String(setor).trim();

            const setoresValidos = [
                'gerencia',
                'estoque',
                'vendas'
            ];

            if (!setoresValidos.includes(setorFormatado)) {
                throw {
                    status: 400,
                    mensagem: 'Setor inválido. Use: gerencia, estoque ou vendas'
                };
            }

            dadosAtualizados.setor = setorFormatado;
        }

        // Cargo
        if (id_cargo !== undefined && id_cargo !== null) {

            if (isNaN(id_cargo)) {
                throw {
                    status: 400,
                    mensagem: 'id_cargo inválido'
                };
            }

            const cargoExiste = await UsuarioRepository.buscarCargoPorId(Number(id_cargo));
            if (!cargoExiste) {
                throw {
                    status: 404,
                    mensagem: 'Cargo informado não existe'
                };
            }

            dadosAtualizados.id_cargo = Number(id_cargo);
        }

        // Foto
        if (foto_perfil !== undefined && foto_perfil !== null) {
            dadosAtualizados.foto_perfil = foto_perfil;
        }

        // Verificar se existe alguma alteração
        if (Object.keys(dadosAtualizados).length === 0) {
            throw {
                status: 400,
                mensagem: 'Nenhum campo válido para atualizar'
            };
        }

        await UsuarioRepository.atualizar(
            id,
            dadosAtualizados
        );

        const usuarioAtualizado =
            await UsuarioRepository.buscarPorId(id);

        return {
            sucesso: true,
            mensagem: 'Usuário atualizado com sucesso',
            dados: usuarioAtualizado
        };
    }

    async removerUsuario(id) {

        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: 'ID inválido'
            };
        }

        const usuarioExiste =
            await UsuarioRepository.buscarPorId(id);

        if (!usuarioExiste) {
            throw {
                status: 404,
                mensagem: 'Usuário não encontrado'
            };
        }

        await UsuarioRepository.remover(id);

        return {
            sucesso: true,
            mensagem: 'Usuário removido com sucesso'
        };
    }
}

module.exports = new UsuarioService();