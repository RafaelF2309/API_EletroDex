const CargoRepository = require('../repositories/CargoRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const authMiddleware = require('./authMiddleware');

async function sincronizarPermissoesDoUsuario(req) {
    let nivelUsuario = req.usuario?.nivel_acesso;
    let setorUsuario = req.usuario?.setor;

    if (req.usuario?.id_usuario) {
        const usuario = await UsuarioRepository.buscarPorId(req.usuario.id_usuario);
        if (!usuario) {
            throw {
                status: 401,
                mensagem: 'Acesso negado: usuário não encontrado ou removido'
            };
        }

        nivelUsuario = usuario.nivel_acesso;
        setorUsuario = usuario.setor;
        req.usuario.nivel_acesso = usuario.nivel_acesso;
        req.usuario.nome_cargo = usuario.nome_cargo;
        req.usuario.setor = usuario.setor;
        req.usuario.id_cargo = usuario.id_cargo;
    } else if (nivelUsuario === undefined && req.usuario?.id_cargo) {
        const cargo = await CargoRepository.buscarPorId(req.usuario.id_cargo);
        if (cargo) {
            nivelUsuario = cargo.nivel_acesso;
            req.usuario.nivel_acesso = cargo.nivel_acesso;
            req.usuario.nome_cargo = cargo.nome_cargo;
        }
    }

    return {
        nivelUsuario: Number(nivelUsuario || 1),
        setorUsuario
    };
}

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

            const { nivelUsuario, setorUsuario } = await sincronizarPermissoesDoUsuario(req);

            if (nivelMinimo !== undefined && nivelUsuario < nivelMinimo) {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: `Acesso negado: operação restrita a usuários com nível de acesso ${nivelMinimo} ou superior`
                });
            }

            if (setores) {
                const listaSetores = (Array.isArray(setores) ? setores : [setores])
                    .map(s => String(s).toLowerCase());
                const setorComparar = String(setorUsuario || '').toLowerCase();

                const permitido = listaSetores.includes(setorComparar) || nivelUsuario >= 3;

                if (!permitido) {
                    return res.status(403).json({
                        sucesso: false,
                        mensagem: `Acesso negado: operação restrita ao(s) setor(es): ${listaSetores.join(', ')}`
                    });
                }
            }

            next();
        } catch (erro) {
            if (erro.status === 401) {
                return res.status(401).json({ sucesso: false, mensagem: erro.mensagem });
            }
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
            const totalUsuarios = await UsuarioRepository.contarTotal();

            if (totalUsuarios === 0) {
                return next();
            }

            return authMiddleware(req, res, async () => {
                try {
                    const { nivelUsuario } = await sincronizarPermissoesDoUsuario(req);

                    if (nivelUsuario < 3) {
                        return res.status(403).json({
                            sucesso: false,
                            mensagem: 'Acesso negado: apenas Gerentes podem cadastrar novos usuários'
                        });
                    }

                    next();
                } catch (erroInterno) {
                    if (erroInterno.status === 401) {
                        return res.status(401).json({ sucesso: false, mensagem: erroInterno.mensagem });
                    }
                    console.error('Erro na autorização de cadastro de usuário:', erroInterno);
                    return res.status(500).json({
                        sucesso: false,
                        mensagem: 'Erro interno ao validar permissão de cadastro'
                    });
                }
            });
        } catch (erro) {
            console.error('Erro na autorização de cadastro de usuário:', erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno ao validar permissão de cadastro'
            });
        }
    };
}

/**
 * Middleware para autorizar visualização de perfil de usuário (GET /usuarios/:id):
 * - O próprio usuário pode visualizar seu próprio perfil.
 * - Outros usuários só podem ser visualizados por quem tem nivel_acesso >= nivelMinimoOutros (padrão: 2 - Estoquista ou Gerente).
 */
function autorizarVisualizacaoUsuario(nivelMinimoOutros = 2) {
    return async (req, res, next) => {
        try {
            if (!req.usuario) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: 'Acesso negado: usuário não autenticado'
                });
            }

            const { nivelUsuario } = await sincronizarPermissoesDoUsuario(req);

            const idParam = Number(req.params.id);
            if (req.usuario.id_usuario === idParam) {
                return next();
            }

            if (nivelUsuario < nivelMinimoOutros) {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Acesso negado: você só pode visualizar o seu próprio perfil'
                });
            }

            next();
        } catch (erro) {
            if (erro.status === 401) {
                return res.status(401).json({ sucesso: false, mensagem: erro.mensagem });
            }
            console.error('Erro na autorização de visualização de usuário:', erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno ao validar permissões de acesso'
            });
        }
    };
}

/**
 * Middleware para autorizar edição de perfil de usuário (PATCH /usuarios/:id):
 * - O próprio usuário pode editar seu perfil (com campos restritos no serviço).
 * - A edição de perfis de outros usuários é restrita a Gerentes (nivel_acesso >= 3).
 */
function autorizarEdicaoUsuario() {
    return async (req, res, next) => {
        try {
            if (!req.usuario) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: 'Acesso negado: usuário não autenticado'
                });
            }

            const { nivelUsuario } = await sincronizarPermissoesDoUsuario(req);

            const idParam = Number(req.params.id);
            if (req.usuario.id_usuario === idParam) {
                return next();
            }

            if (nivelUsuario < 3) {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: 'Acesso negado: apenas Gerentes podem editar outros usuários'
                });
            }

            next();
        } catch (erro) {
            if (erro.status === 401) {
                return res.status(401).json({ sucesso: false, mensagem: erro.mensagem });
            }
            console.error('Erro na autorização de edição de usuário:', erro);
            return res.status(500).json({
                sucesso: false,
                mensagem: 'Erro interno ao validar permissões de acesso'
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
    autorizarCadastroUsuario,
    autorizarVisualizacaoUsuario,
    autorizarEdicaoUsuario
};
