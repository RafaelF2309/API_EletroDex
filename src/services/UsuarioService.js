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
        const { nome, email, senha, setor, cargo, imagem } = dados;

        if (!nome || !email || !senha || !setor || !cargo || !imagem) {
            throw { status: 400, mensagem: 'Campos obrigatórios faltando: nome, email, senha, setor, cargo e imagem' };
        }


        const usuarioExistente = await UsuarioRepository.buscarPorEmail(email);
        if (usuarioExistente) {
            throw { status: 409, mensagem: 'Já existe um usuário cadastrado com este e-mail' };
        }

        const novoId = await UsuarioRepository.criar({ 
            nome: nome.trim(), 
            email, 
            senha, 
            setor, 
            cargo, 
            imagem: imagem || null
        });
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

        const { nome, email, senha, setor, cargo, imagem  } = dados;
        const dadosAtualizados = {};

        if (nome !== undefined && nome !== null && nome.trim() !== '') dadosAtualizados.nome = nome.trim();
        if (email !== undefined) dadosAtualizados.email = email;
        if (senha !== undefined) dadosAtualizados.senha = senha;
        if (setor !== undefined) dadosAtualizados.setor = setor;
        if (cargo !== undefined) dadosAtualizados.cargo = cargo;
        if (imagem !== undefined && imagem !== null) dadosAtualizados.imagem = imagem;

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
