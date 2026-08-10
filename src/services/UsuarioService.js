const bcrypt = require('bcrypt');
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

        // Remoção da obrigatoriedade rígida de imagem (se for opcional)
        if (!nome || !email || !senha || !setor || !cargo) {
            throw { status: 400, mensagem: 'Campos obrigatórios faltando: nome, email, senha, setor e cargo' };
        }

        // Normalização do e-mail
        const emailFormatado = String(email).trim().toLowerCase();

        const usuarioExistente = await UsuarioRepository.buscarPorEmail(emailFormatado);
        if (usuarioExistente) {
            throw { status: 409, mensagem: 'Já existe um usuário cadastrado com este e-mail' };
        }

        // Hash da senha com bcrypt
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        const novoId = await UsuarioRepository.criar({ 
            nome: String(nome).trim(), 
            email: emailFormatado, 
            senha: senhaHash, 
            setor: String(setor).trim(), 
            cargo: String(cargo).trim(), 
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

        const { nome, email, senha, setor, cargo, imagem } = dados;
        const dadosAtualizados = {};

        // Atualização de Nome
        if (nome !== undefined && nome !== null) {
            const nomeFormatado = String(nome).trim();
            if (nomeFormatado === '') throw { status: 400, mensagem: 'O nome não pode ser vazio' };
            dadosAtualizados.nome = nomeFormatado;
        }

        // Atualização de E-mail (com verificação em outros usuários)
        if (email !== undefined && email !== null) {
            const emailFormatado = String(email).trim().toLowerCase();
            if (emailFormatado === '') throw { status: 400, mensagem: 'O e-mail não pode ser vazio' };

            if (emailFormatado !== usuarioExiste.email) {
                const outroUsuario = await UsuarioRepository.buscarPorEmail(emailFormatado);
                if (outroUsuario) {
                    throw { status: 409, mensagem: 'Já existe outro usuário cadastrado com este e-mail' };
                }
                dadosAtualizados.email = emailFormatado;
            }
        }

        // Atualização e Hash da Senha (caso seja alterada)
        if (senha !== undefined && senha !== null && String(senha).trim() !== '') {
            const saltRounds = 10;
            dadosAtualizados.senha = await bcrypt.hash(String(senha), saltRounds);
        }

        if (setor !== undefined && setor !== null) dadosAtualizados.setor = String(setor).trim();
        if (cargo !== undefined && cargo !== null) dadosAtualizados.cargo = String(cargo).trim();
        if (imagem !== undefined && imagem !== null) dadosAtualizados.imagem = imagem;

        if (Object.keys(dadosAtualizados).length === 0) {
            throw { status: 400, mensagem: 'Nenhum campo válido para atualizar' };
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