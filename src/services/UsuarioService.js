const bcrypt = require('bcrypt');

const UsuarioRepository = require('../repositories/UsuarioRepository');
const CargoRepository = require('../repositories/CargoRepository');

const SETORES_VALIDOS = ['gerencia', 'estoque', 'vendas'];

class UsuarioService {

    validarSetor(setor) {
        const setorFormatado = String(setor).trim();
        if (!SETORES_VALIDOS.includes(setorFormatado)) {
            throw {
                status: 400,
                mensagem: 'Setor inválido. Use: gerencia, estoque ou vendas'
            };
        }
        return setorFormatado;
    }

    async resolverNivelUsuario(usuarioLogado) {
        if (!usuarioLogado) {
            return 1;
        }

        if (usuarioLogado.id_usuario) {
            const usuarioAtual = await UsuarioRepository.buscarPorId(usuarioLogado.id_usuario);
            if (usuarioAtual?.nivel_acesso !== undefined) {
                return Number(usuarioAtual.nivel_acesso);
            }
        }

        if (usuarioLogado.nivel_acesso !== undefined) {
            return Number(usuarioLogado.nivel_acesso);
        }

        if (usuarioLogado.id_cargo) {
            const cargo = await CargoRepository.buscarPorId(usuarioLogado.id_cargo);
            if (cargo) {
                return Number(cargo.nivel_acesso);
            }
        }

        return 1;
    }

    async listarUsuarios() {
        const usuarios = await UsuarioRepository.listarTodos();

        return {
            sucesso: true,
            dados: usuarios,
            total: usuarios.length
        };
    }

    async buscarUsuarioPorId(id, usuarioLogado) {

        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: 'ID inválido'
            };
        }

        const idAlvo = Number(id);

        if (usuarioLogado) {
            const isProprio = Number(usuarioLogado.id_usuario) === idAlvo;
            const nivel = await this.resolverNivelUsuario(usuarioLogado);
            if (!isProprio && nivel < 2) {
                throw {
                    status: 403,
                    mensagem: 'Acesso negado: você só pode visualizar o seu próprio perfil'
                };
            }
        }

        const usuario = await UsuarioRepository.buscarPorId(idAlvo);

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

        // Campos obrigatórios
        if (!nome || !email || !senha || !setor || !id_cargo) {
            throw {
                status: 400,
                mensagem: 'Campos obrigatórios faltando: nome, email, senha, setor e id_cargo'
            };
        }

        // Validar ID do cargo
        if (isNaN(id_cargo)) {
            throw {
                status: 400,
                mensagem: 'id_cargo inválido'
            };
        }

        // Verificar se o cargo existe
        const cargoExiste = await CargoRepository.buscarPorId(
            Number(id_cargo)
        );

        if (!cargoExiste) {
            throw {
                status: 404,
                mensagem: 'Cargo informado não existe'
            };
        }

        const setorFormatado = this.validarSetor(setor);

        // Normalizar e-mail
        const emailFormatado = String(email)
            .trim()
            .toLowerCase();

        // Verificar e-mail duplicado
        const usuarioExistente =
            await UsuarioRepository.buscarPorEmail(
                emailFormatado
            );

        if (usuarioExistente) {
            throw {
                status: 409,
                mensagem: 'Já existe um usuário cadastrado com este e-mail'
            };
        }

        // Criptografar senha
        const senhaHash = await bcrypt.hash(
            String(senha),
            10
        );

        // Criar usuário
        const novoId = await UsuarioRepository.criar({
            nome: String(nome).trim(),
            email: emailFormatado,
            senha: senhaHash,
            setor: setorFormatado,
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

    async atualizarUsuario(id, dados, usuarioLogado) {

        if (!id || isNaN(id)) {
            throw {
                status: 400,
                mensagem: 'ID inválido'
            };
        }

        const idAlvo = Number(id);

        const usuarioExiste =
            await UsuarioRepository.buscarPorId(idAlvo);

        if (!usuarioExiste) {
            throw {
                status: 404,
                mensagem: 'Usuário não encontrado'
            };
        }

        // Validação de Permissões
        const nivelLogado = await this.resolverNivelUsuario(usuarioLogado);
        const isGerente = nivelLogado >= 3;
        const isProprioUsuario = usuarioLogado && Number(usuarioLogado.id_usuario) === idAlvo;

        // Regra 1: Apenas Gerente pode editar perfil de outros usuários
        if (usuarioLogado && !isProprioUsuario && !isGerente) {
            throw {
                status: 403,
                mensagem: 'Acesso negado: apenas Gerentes podem editar outros usuários'
            };
        }

        // Regra 2: Apenas Gerente pode alterar id_cargo ou setor
        if (usuarioLogado && !isGerente) {
            if (dados.id_cargo !== undefined || dados.setor !== undefined) {
                throw {
                    status: 403,
                    mensagem: 'Acesso negado: apenas Gerentes podem alterar cargo ou setor'
                };
            }
            if (dados.email !== undefined && String(dados.email).trim().toLowerCase() !== usuarioExiste.email) {
                throw {
                    status: 403,
                    mensagem: 'Acesso negado: apenas Gerentes podem alterar o e-mail cadastrado'
                };
            }
        }

        const {
            nome,
            email,
            senha,
            senha_atual,
            senhaAtual,
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
            // Se for o próprio usuário alterando a senha, exige a senha atual
            if (isProprioUsuario) {
                const senhaAtualInformada = senha_atual || senhaAtual;
                if (!senhaAtualInformada) {
                    throw {
                        status: 400,
                        mensagem: 'Para alterar a senha, é necessário informar a senha atual (senha_atual)'
                    };
                }

                const senhaHashBanco = await UsuarioRepository.buscarSenhaPorId(idAlvo);
                const senhaCorreta = await bcrypt.compare(String(senhaAtualInformada), senhaHashBanco || '');

                if (!senhaCorreta) {
                    throw {
                        status: 401,
                        mensagem: 'Senha atual incorreta'
                    };
                }
            }

            dadosAtualizados.senha =
                await bcrypt.hash(
                    String(senha),
                    10
                );
        }

        // Setor
        if (setor !== undefined && setor !== null) {
            dadosAtualizados.setor = this.validarSetor(setor);
        }

        // Cargo
        if (id_cargo !== undefined && id_cargo !== null) {

            if (isNaN(id_cargo)) {
                throw {
                    status: 400,
                    mensagem: 'id_cargo inválido'
                };
            }

            const cargoExiste =
                await CargoRepository.buscarPorId(
                    Number(id_cargo)
                );

            if (!cargoExiste) {
                throw {
                    status: 404,
                    mensagem: 'Cargo informado não existe'
                };
            }

            dadosAtualizados.id_cargo = Number(id_cargo);
        }

        // Foto
        if (
            foto_perfil !== undefined &&
            foto_perfil !== null
        ) {
            dadosAtualizados.foto_perfil = foto_perfil;
        }

        // Nenhuma alteração
        if (Object.keys(dadosAtualizados).length === 0) {
            throw {
                status: 400,
                mensagem: 'Nenhum campo válido para atualizar'
            };
        }

        await UsuarioRepository.atualizar(
            idAlvo,
            dadosAtualizados
        );

        const usuarioAtualizado =
            await UsuarioRepository.buscarPorId(idAlvo);

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

        const dependencias =
            await UsuarioRepository.contarDependencias(id);

        if (dependencias > 0) {
            throw {
                status: 409,
                mensagem: 'Usuário possui movimentações ou ajustes vinculados e não pode ser removido'
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