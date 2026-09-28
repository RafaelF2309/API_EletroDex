const CargoRepository = require('../repositories/CargoRepository');
const pool = require('../config/database');

/**
 * Middleware de Autorização baseado em Nível de Acesso (nivel_acesso) e Setor (setor)
 *
 * Exemplos de uso:
 * - permitirNivel(3) // Apenas Gerente (nivel 3)
 * - permitirNivel(2) // Gerente (3) e Estoquista (2)
 * - permitirSetores('gerencia', 'estoque')
 */
function autorizar(opcoes = {}) {
    const config = typeof opcoes === 'number' ? { nivelMinimo: opcoes } : opcoes;
    const { nivelMinimo, setores } = config;

    return async (req, res, next) => {
        try {
            if (!req.usuario) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: 'Acesso negado: usuário não autenticado'
                });
            }

            // Obtém o nivel_acesso do token ou busca pelo id_cargo no banco
            let nivelUsuario = req.usuario.nivel_acesso;
            if (nivelUsuario === undefined && req.usuario.id_cargo) {
                const cargo = await CargoRepository.buscarPorId(req.usuario.id_cargo);
                if (cargo) {
                    nivelUsuario = cargo.nivel_acesso;
                    req.usuario.nivel_acesso = cargo.nivel_acesso;
                    req.usuario.nome_cargo = cargo.nome_cargo;
                }
            }

            nivelUsuario = Number(nivelUsuario || 1);

            // Validação de Nível Mínimo de Acesso
            if (nivelMinimo !== undefined && nivelUsuario < nivelMinimo) {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: `Acesso negado: operação restrita a usuários com nível de acesso ${nivelMinimo} ou superior`
                });
            }

            // Validação de Setores permitidos
            if (setores) {
                const listaSetores = (Array.isArray(setores) ? setores : [setores])
                    .map(s => String(s).toLowerCase());
                const setorUsuario = String(req.usuario.setor || '').toLowerCase();

                // Gerente (nível 3) tem acesso global a todos os setores
                const permitido = listaSetores.includes(setorUsuario) || nivelUsuario >= 3;

                if (!permitido) {
                    return res.status(403).json({
                        sucesso: false,
                        mensagem: `Acesso negado: operação restrita ao(s) setor(es): ${listaSetores.join(', ')}`
                    });
                }
            }

            next();
        } catch (erro) {
            console.error('Erro no middleware de autorização:', erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno ao validar permissões de acesso'
            });
        }
    };
}

/**
 * Middleware especial para cadastro de usuário:
 * - Se não houver nenhum usuário cadastrado no sistema (primeiro acesso), permite o cadastro.
 * - Caso já existam usuários, exige autenticação e permissão de Gerente (nivel_acesso >= 3).
 */
function autorizarCadastroUsuario() {
    return async (req, res, next) => {
        try {
            const [resultado] = await pool.query('SELECT COUNT(*) AS total FROM usuario');
            const totalUsuarios = resultado[0].total;

            // Se for o primeiro usuário do sistema (bootstrap inicial), permite
            if (totalUsuarios === 0) {
                return next();
            }

            // Caso já existam usuários, exige token de autenticação
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: 'Token de autenticação não informado. Cadastro de novos usuários restrito a Gerentes'
                });
            }

            const jwt = require('jsonwebtoken');
            const partes = authHeader.split(' ');
            if (partes.length !== 2 || partes[0] !== 'Bearer') {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: 'Formato do token inválido'
                });
            }

            const jwtSecret = process.env.JWT_SECRET || 'eletrodex_secret_key_2026_super_segura';
            let decoded;
            try {
                decoded = jwt.verify(partes[1], jwtSecret);
            } catch (jwtErr) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: jwtErr.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido'
                });
            }

            req.usuario = decoded;

            // Verifica se o usuário autenticado tem nivel_acesso >= 3
            let nivelUsuario = req.usuario.nivel_acesso;
            if (nivelUsuario === undefined && req.usuario.id_cargo) {
                const cargo = await CargoRepository.buscarPorId(req.usuario.id_cargo);
                if (cargo) {
                    nivelUsuario = cargo.nivel_acesso;
                }
            }

            if (Number(nivelUsuario || 1) < 3) {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Acesso negado: apenas Gerentes podem cadastrar novos usuários'
                });
            }

            next();
        } catch (erro) {
            console.error('Erro na autorização de cadastro de usuário:', erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno ao validar permissão de cadastro'
            });
        }
    };
}

const permitirNivel = (nivelMinimo) => autorizar({ nivelMinimo });
const permitirSetores = (...setores) => autorizar({ setores });

module.exports = {
    autorizar,
    permitirNivel,
    permitirSetores,
    autorizarCadastroUsuario
};
