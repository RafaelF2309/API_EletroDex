const UsuarioRepository = require('../repositories/UsuarioRepository');

class UsuarioService {
    async listarUsuarios() {
        const usuarios = await UsuarioRepository.listarTodos();
        return { sucesso: true, dados: usuarios, total: usuarios.length };
    }

    async buscarUsuarioPorId(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const usuario = await UsuarioRepository.buscarPorId(id);

        if (!usuario) {
            throw { status: 404, mensagem: 'Usuário não encontrado' };
        }

        return { sucesso: true, dados: usuario };
    }

    async criarUsuario(dados) {
        const { nome, email, senha, setor, cargo } = dados;

        if (!nome || !email || !senha || !setor || !cargo) {
            throw { status: 400, mensagem: 'Campos obrigatórios faltando: nome, email, senha, setor, cargo' };
        }

        const usuarioExistente = await UsuarioRepository.buscarPorEmail(email);
        if (usuarioExistente) {
            throw { status: 409, mensagem: 'Já existe um usuário cadastrado com este e-mail' };
        }

        const novoId = await UsuarioRepository.criar({ nome, email, senha, setor, cargo });
        const usuarioCriado = await UsuarioRepository.buscarPorId(novoId);

        return { sucesso: true, mensagem: 'Usuário cadastrado com sucesso', dados: usuarioCriado };
    }

    async atualizarUsuario(id, dados) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const usuarioExiste = await UsuarioRepository.buscarPorId(id);
        if (!usuarioExiste) {
            throw { status: 404, mensagem: 'Usuário não encontrado' };
        }

        const { nome, email, senha, setor, cargo } = dados;
        const dadosAtualizados = {};

        if (nome !== undefined) dadosAtualizados.nome = nome;
        if (email !== undefined) dadosAtualizados.email = email;
        if (senha !== undefined) dadosAtualizados.senha = senha;
        if (setor !== undefined) dadosAtualizados.setor = setor;
        if (cargo !== undefined) dadosAtualizados.cargo = cargo;

        if (Object.keys(dadosAtualizados).length === 0) {
            throw { status: 400, mensagem: 'Nenhum campo para atualizar' };
        }

        await UsuarioRepository.atualizar(id, dadosAtualizados);
        const usuarioAtualizado = await UsuarioRepository.buscarPorId(id);

        return { sucesso: true, mensagem: 'Usuário atualizado com sucesso', dados: usuarioAtualizado };
    }

    async removerUsuario(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' };
        }

        const usuarioExiste = await UsuarioRepository.buscarPorId(id);
        if (!usuarioExiste) {
            throw { status: 404, mensagem: 'Usuário não encontrado' };
        }

        await UsuarioRepository.remover(id);
        return { sucesso: true, mensagem: 'Usuário removido com sucesso' };
    }
}

module.exports = new UsuarioService();
