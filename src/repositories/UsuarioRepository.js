const pool = require('../config/database');

class UsuarioRepository {
    async listarTodos() {
        const [usuarios] = await pool.query(
            'SELECT id_usuario, nome, dt_cadastro, email, setor, cargo FROM usuario ORDER BY id_usuario DESC'
        );
        return usuarios;
    }

    async buscarPorId(id) {
        const [usuarios] = await pool.query(
            'SELECT id_usuario, nome, dt_cadastro, email, setor, cargo FROM usuario WHERE id_usuario = ?',
            [id]
        );
        return usuarios[0];
    }

    async buscarPorEmail(email) {
        const [usuarios] = await pool.query(
            'SELECT * FROM usuario WHERE email = ?',
            [email]
        );
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

        if (camposUsuario.length === 0) return 0;

        valoresUsuario.push(id);

        const query = `UPDATE usuario SET ${camposUsuario.join(', ')} WHERE id_usuario = ?`;

        const [resultado] = await pool.query(query, valoresUsuario);

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