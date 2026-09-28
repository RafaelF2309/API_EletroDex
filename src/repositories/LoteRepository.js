const pool = require('../config/database');

class LoteRepository {
    async listarTodos() {
        const [lotes] = await pool.query(
            'SELECT * FROM lote ORDER BY id_lote DESC'
        );
        return lotes;
    }

    async buscarPorId(id) {
        const [lotes] = await pool.query(
            'SELECT * FROM lote WHERE id_lote = ?',
            [id]
        );
        return lotes[0];
    }

    async buscarPorNumeroLote(numero_lote) {
        const [lotes] = await pool.query(
            'SELECT * FROM lote WHERE numero_lote = ?',
            [numero_lote]
        );
        return lotes[0];
    }

    async contarDependencias(id) {
        const [resultados] = await pool.query(
            `SELECT
                (SELECT COUNT(*) FROM estoque WHERE id_lote = ?) +
                (SELECT COUNT(*) FROM entrada WHERE id_lote = ?) +
                (SELECT COUNT(*) FROM saida WHERE id_lote = ?) +
                (SELECT COUNT(*) FROM ajustes WHERE id_lote = ?) AS total`,
            [id, id, id, id]
        );
        return Number(resultados[0].total);
    }

    async criar(dados) {
        const [resultado] = await pool.query(
            'INSERT INTO lote SET ?',
            [dados]
        );
        return resultado.insertId;
    }

    async atualizar(id, dados) {
        const [resultado] = await pool.query(
            'UPDATE lote SET ? WHERE id_lote = ?',
            [dados, id]
        );
        return resultado.affectedRows > 0;
    }

    async remover(id) {
        const [resultado] = await pool.query(
            'DELETE FROM lote WHERE id_lote = ?',
            [id]
        );
        return resultado.affectedRows > 0;
    }
}

module.exports = new LoteRepository();
