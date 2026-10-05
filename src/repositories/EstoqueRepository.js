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
                p.estoque_minimo
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
                p.estoque_minimo
            FROM estoque e
            LEFT JOIN produto p ON e.id_produto = p.id_produto
            WHERE e.id_estoque = ?`,
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

    async buscarPorLote(id_lote) {
        const [estoques] = await pool.query(
            `SELECT e.*
             FROM estoque e
             WHERE e.id_lote = ?`,
            [id_lote]
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

    async ajustarComAuditoria(id_estoque, id_usuario, diferenca, motivo) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [estoques] = await connection.query(
                'SELECT * FROM estoque WHERE id_estoque = ? FOR UPDATE',
                [id_estoque]
            );
            const estoque = estoques[0];
            if (!estoque) {
                const erro = new Error('Registro de estoque não encontrado');
                erro.status = 404;
                throw erro;
            }

            const qtdNova = estoque.qtd_atual + diferenca;
            if (qtdNova < 0) {
                const erro = new Error('O ajuste não pode deixar o estoque negativo');
                erro.status = 400;
                throw erro;
            }

            await connection.query(
                'UPDATE estoque SET qtd_atual = ? WHERE id_estoque = ?',
                [qtdNova, id_estoque]
            );
            const [ajuste] = await connection.query(
                `INSERT INTO ajustes
                 (id_usuario, id_produto, id_lote, qtd_anterior, diferenca, qtd_nova, motivo)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id_usuario, estoque.id_produto, estoque.id_lote, estoque.qtd_atual, diferenca, qtdNova, motivo]
            );
            await connection.commit();
            return { id_ajuste: ajuste.insertId, estoque: { ...estoque, qtd_atual: qtdNova } };
        } catch (erro) {
            await connection.rollback();
            throw erro;
        } finally {
            connection.release();
        }
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
