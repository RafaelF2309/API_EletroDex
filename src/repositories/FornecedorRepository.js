const pool = require('../config/database');

class FornecedorRepository {
    async listarTodos() {
        const [fornecedores] = await pool.query(
            'SELECT * FROM fornecedor ORDER BY id_fornecedor DESC'
        );
        return fornecedores;
    }

    async buscarPorId(id) {
        const [fornecedores] = await pool.query(
            'SELECT * FROM fornecedor WHERE id_fornecedor = ?',
            [id]
        );
        return fornecedores[0];
    }

    async buscarPorCnpj(cnpj) {
        const [fornecedores] = await pool.query(
            'SELECT * FROM fornecedor WHERE cnpj = ?',
            [cnpj]
        );
        return fornecedores[0];
    }

    async contarDependencias(id) {
        const [resultados] = await pool.query(
            `SELECT
                (SELECT COUNT(*) FROM lote WHERE id_fornecedor = ?) +
                (SELECT COUNT(*) FROM entrada WHERE id_fornecedor = ?) +
                (SELECT COUNT(*) FROM saida WHERE id_fornecedor = ?) AS total`,
            [id, id, id]
        );
        return Number(resultados[0].total);
    }

    async criar(dados) {
        const [resultado] = await pool.query(
            'INSERT INTO fornecedor SET ?',
            [dados]
        );
        return resultado.insertId;
    }

    async atualizar(id, dados) {
        const [resultado] = await pool.query(
            'UPDATE fornecedor SET ? WHERE id_fornecedor = ?',
            [dados, id]
        );
        return resultado.affectedRows > 0;
    }

    async remover(id) {
        const [resultado] = await pool.query(
            'DELETE FROM fornecedor WHERE id_fornecedor = ?',
            [id]
        );
        return resultado.affectedRows > 0;
    }
}

module.exports = new FornecedorRepository();
