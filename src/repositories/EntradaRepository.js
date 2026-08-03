const pool = require('../config/database');

class EntradaRepository {
    async listarTodos() {
        const [entradas] = await pool.query(
            'SELECT * FROM entrada ORDER BY id_entrada DESC'
        );
        return entradas;
    }

    async buscarPorId(id) {
        const [entradas] = await pool.query(
            'SELECT * FROM entrada WHERE id_entrada = ?',
            [id]
        );
        return entradas[0];
    }

    async criar(dados) {
        const [resultado] = await pool.query(
            'INSERT INTO entrada SET ?',
            [dados]
        );
        return resultado.insertId;
    }

    async atualizar(id, dados) {
        const [resultado] = await pool.query(
            'UPDATE entrada SET ? WHERE id_entrada = ?',
            [dados, id]
        );
        return resultado.affectedRows > 0;
    }

    async remover(id) {
        const [resultado] = await pool.query(
            'DELETE FROM entrada WHERE id_entrada = ?',
            [id]
        );
        return resultado.affectedRows > 0;
    }
}

module.exports = new EntradaRepository();
