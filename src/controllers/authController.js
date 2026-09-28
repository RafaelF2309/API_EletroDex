const AuthService = require('../services/AuthService');

class AuthController {
    async login(req, res) {
        try {
<<<<<<< HEAD
            const { email, senha } = req.body;

            // Verificar se os campos foram enviados
            if (!email || !senha) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'E-mail e senha são obrigatórios'
                });
            }

            // Normalizar e-mail
            const emailFormatado = String(email).trim().toLowerCase();

            // Buscar usuário pelo e-mail
            const usuario = await UsuarioRepository.buscarPorEmail(emailFormatado);

            if (!usuario) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: 'E-mail ou senha inválidos'
                });
            }

            // Comparar senha informada com senha criptografada
            const senhaCorreta = await bcrypt.compare(String(senha), usuario.senha);

            if (!senhaCorreta) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: 'E-mail ou senha inválidos'
                });
            }

            const jwtSecret = process.env.JWT_SECRET || 'eletrodex_secret_key_2026_super_segura';
            const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '8h';

            // Criar payload do token
            const payload = {
                id_usuario: usuario.id_usuario,
                nome: usuario.nome,
                email: usuario.email,
                setor: usuario.setor,
                id_cargo: usuario.id_cargo,
                nome_cargo: usuario.nome_cargo,
                nivel_acesso: usuario.nivel_acesso
            };

            // Gerar JWT
            const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

            // Não enviar a senha para o cliente
            const usuarioSeguro = {
                id_usuario: usuario.id_usuario,
                nome: usuario.nome,
                email: usuario.email,
                setor: usuario.setor,
                id_cargo: usuario.id_cargo,
                nome_cargo: usuario.nome_cargo,
                nivel_acesso: usuario.nivel_acesso,
                foto_perfil: usuario.foto_perfil
            };

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Login realizado com sucesso',
                token,
                usuario: usuarioSeguro
            });

=======
            const resultado = await AuthService.login(req.body);
            return res.status(200).json(resultado);
>>>>>>> 6336b4dfb45c281e5aea49faff9ab12de2caf7bb
        } catch (erro) {
            return res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.mensagem || 'Erro interno ao realizar login'
            });
        }
    }
}

module.exports = new AuthController();
