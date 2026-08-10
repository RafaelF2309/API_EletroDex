const pool = require('../config/database');

class EstoqueRepository {
    async listarTodos() {
        const [estoques] = await pool.query(
            'SELECT * FROM estoque ORDER BY id_estoque DESC'
        );
        return estoques;
    }

    async buscarPorId(id) {
        const [estoques] = await pool.query(
            'SELECT * FROM estoque WHERE id_estoque = ?',
            [id]
        );
        return estoques[0];
    }

    async buscarPorProdutoELote(id_produto, numero_lote) {
        const [estoques] = await pool.query(
            `SELECT e.*
             FROM estoque e
             INNER JOIN lote l ON e.id_lote = l.id_lote
             WHERE e.id_produto = ?
             AND l.numero_lote = ?`,
            [id_produto, numero_lote]
        );

        return estoques[0];
    }

    async alterarQuantidade(id_estoque, diferenca) {
        const [resultado] = await pool.query(
            `UPDATE estoque
             SET qtd_atual = qtd_atual + ?
             WHERE id_estoque = ?
             AND qtd_atual + ? >= 0`,
            [diferenca, id_estoque, diferenca]
        );

        return resultado.affectedRows > 0;
    }

    async criar(dados) {
        const [resultado] = await pool.query(
            'INSERT INTO estoque SET ?',
            [dados]
        );
        return resultado.insertId;
    }

    async atualizar(id, dados) {
        const [resultado] = await pool.query(
            'UPDATE estoque SET ? WHERE id_estoque = ?',
            [dados, id]
        );
        return resultado.affectedRows > 0;
    }

    async remover(id) {
        const [resultado] = await pool.query(
            'DELETE FROM estoque WHERE id_estoque = ?',
            [id]
        );
        return resultado.affectedRows > 0;
    }
}

module.exports = new EstoqueRepository();