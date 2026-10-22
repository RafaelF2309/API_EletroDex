module.exports = function configurarMockAutorizacao(jwt, UsuarioRepository) {
    const mockReturnValueOriginal = jwt.verify.mockReturnValue.bind(jwt.verify);

    jwt.verify.mockReturnValue = (usuario) => {
        UsuarioRepository.buscarPorId.mockResolvedValue({
            id_usuario: usuario.id_usuario,
            nome: usuario.nome || 'Usuário de teste',
            email: usuario.email || 'teste@teste.com',
            setor: usuario.setor,
            id_cargo: usuario.id_cargo || 1,
            nome_cargo: usuario.nome_cargo || (Number(usuario.nivel_acesso) >= 3 ? 'Gerente' : Number(usuario.nivel_acesso) === 2 ? 'Estoquista' : 'Vendedor'),
            nivel_acesso: usuario.nivel_acesso,
            foto_perfil: usuario.foto_perfil || null
        });

        return mockReturnValueOriginal(usuario);
    };
};
