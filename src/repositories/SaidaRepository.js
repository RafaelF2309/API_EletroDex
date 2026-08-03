const pool = require('../config/database');

class SaidaRepository {
    async listarTodos() {
        const [saidas] = await pool.query(
            'SELECT * FROM saida ORDER BY id_saida DESC'
        );
        return saidas;
    }

    async buscarPorId(id) {
        const [saidas] = await pool.query(
            'SELECT * FROM saida WHERE id_saida = ?',
            [id]
        );
        return saidas[0];
    }

    async criar(dados) {
        const [resultado] = await pool.query(
            'INSERT INTO saida SET ?',
            [dados]
        );
        return resultado.insertId;
    }

    async atualizar(id, dados) {
        const [resultado] = await pool.query(
            'UPDATE saida SET ? WHERE id_saida = ?',
            [dados, id]
        );
        return resultado.affectedRows > 0;
    }

    async remover(id) {
        const [resultado] = await pool.query(
            'DELETE FROM saida WHERE id_saida = ?',
            [id]
        );
        return resultado.affectedRows > 0;
    }
}

module.exports = new SaidaRepository();
