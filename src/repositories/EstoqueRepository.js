const pool = require('../config/database');

class EstoqueRepository {
    async listarTodos() {
        const [estoques] = await pool.query(
            `SELECT 
                e.id_estoque,
                e.id_produto,
                e.id_lote,
                e.qtd_atual,
                e.localizacao_corredor,
                e.localizacao_prateleira,
                p.nome AS nome_produto,
                p.estoque_minimo,
                (e.qtd_atual <= p.estoque_minimo) AS abaixo_do_minimo
            FROM estoque e
            LEFT JOIN produto p ON e.id_produto = p.id_produto
            ORDER BY e.id_estoque DESC`
        );
        return estoques;
    }

    async buscarPorId(id) {
        const [estoques] = await pool.query(
            `SELECT 
                e.id_estoque,
                e.id_produto,
                e.id_lote,
                e.qtd_atual,
                e.localizacao_corredor,
                e.localizacao_prateleira,
                p.nome AS nome_produto,
                p.estoque_minimo,
                (e.qtd_atual <= p.estoque_minimo) AS abaixo_do_minimo
            FROM estoque e
            LEFT JOIN produto p ON e.id_produto = p.id_produto
            WHERE e.id_estoque = ?`,
            [id]
        );
        return estoques[0];
    }

    async listarAbaixoDoMinimo() {
        const [estoques] = await pool.query(
            `SELECT 
                e.id_estoque,
                e.id_produto,
                e.id_lote,
                e.qtd_atual,
                e.localizacao_corredor,
                e.localizacao_prateleira,
                p.nome AS nome_produto,
                p.estoque_minimo,
                1 AS abaixo_do_minimo
            FROM estoque e
            INNER JOIN produto p ON e.id_produto = p.id_produto
            WHERE e.qtd_atual <= p.estoque_minimo
            ORDER BY e.id_estoque DESC`
        );
        return estoques;
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