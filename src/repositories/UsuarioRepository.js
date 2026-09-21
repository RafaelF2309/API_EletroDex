const pool = require('../config/database');

class UsuarioRepository {

    async buscarCargoPorId(id) {
        const [cargos] = await pool.query(
            'SELECT id_cargo, nome_cargo, descricao, nivel_acesso FROM cargo WHERE id_cargo = ?',
            [id]
        );

        return cargos[0];
    }

    async listarTodos() {

        const [usuarios] = await pool.query(`
            SELECT
                u.id_usuario,
                u.nome,
                u.dt_cadastro,
                u.email,
                u.setor,
                u.id_cargo,
                c.nome_cargo,
                u.foto_perfil
            FROM usuario u
            INNER JOIN cargo c
                ON u.id_cargo = c.id_cargo
            ORDER BY u.id_usuario DESC
        `);

        return usuarios;
    }

    async buscarPorId(id) {

        const [usuarios] = await pool.query(`
            SELECT
                u.id_usuario,
                u.nome,
                u.dt_cadastro,
                u.email,
                u.setor,
                u.id_cargo,
                c.nome_cargo,
                u.foto_perfil
            FROM usuario u
            INNER JOIN cargo c
                ON u.id_cargo = c.id_cargo
            WHERE u.id_usuario = ?
        `, [id]);

        return usuarios[0];
    }

    async buscarPorEmail(email) {

        const [usuarios] = await pool.query(`
            SELECT
                u.*,
                c.nome_cargo,
                c.nivel_acesso
            FROM usuario u
            INNER JOIN cargo c
                ON u.id_cargo = c.id_cargo
            WHERE u.email = ?
        `, [email]);

        return usuarios[0];
    }

    async criar(dados) {

        const [resultado] = await pool.query(
            'INSERT INTO usuario SET ?',
            [dados]
        );

        return resultado.insertId;
    }

    async atualizar(id, dados) {

        const camposUsuario = [];
        const valoresUsuario = [];

        for (const [key, value] of Object.entries(dados)) {

            camposUsuario.push(`${key} = ?`);
            valoresUsuario.push(value);
        }

        if (camposUsuario.length === 0) {
            return 0;
        }

        valoresUsuario.push(id);

        const query = `
            UPDATE usuario
            SET ${camposUsuario.join(', ')}
            WHERE id_usuario = ?
        `;

        const [resultado] = await pool.query(
            query,
            valoresUsuario
        );

        return resultado.affectedRows;
    }

    async remover(id) {

        const [resultado] = await pool.query(
            'DELETE FROM usuario WHERE id_usuario = ?',
            [id]
        );

        return resultado.affectedRows > 0;
    }
}

module.exports = new UsuarioRepository();