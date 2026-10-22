const pool = require('../config/database');

class LoteRepository {
    async listarTodos(filtros = {}) {
        const whereConditions = [];
        const params = [];

        if (filtros.id_produto) {
            whereConditions.push('l.id_produto = ?');
            params.push(Number(filtros.id_produto));
        } else if (filtros.produto) {
            if (!isNaN(filtros.produto)) {
                whereConditions.push('l.id_produto = ?');
                params.push(Number(filtros.produto));
            } else {
                whereConditions.push('p.nome LIKE ?');
                params.push(`%${filtros.produto}%`);
            }
        }

        if (filtros.numero_lote) {
            whereConditions.push('l.numero_lote LIKE ?');
            params.push(`%${filtros.numero_lote}%`);
        } else if (filtros.lote) {
            whereConditions.push('l.numero_lote LIKE ?');
            params.push(`%${filtros.lote}%`);
        }

        if (filtros.id_fornecedor) {
            whereConditions.push('l.id_fornecedor = ?');
            params.push(Number(filtros.id_fornecedor));
        } else if (filtros.fornecedor) {
            if (!isNaN(filtros.fornecedor)) {
                whereConditions.push('l.id_fornecedor = ?');
                params.push(Number(filtros.fornecedor));
            } else {
                whereConditions.push('f.nome_fornecedor LIKE ?');
                params.push(`%${filtros.fornecedor}%`);
            }
        }

        const whereClause = whereConditions.length > 0 ? ` WHERE ${whereConditions.join(' AND ')}` : '';

        const temPaginacao = filtros.page !== undefined || filtros.limit !== undefined;
        let totalCount = null;

        if (temPaginacao) {
            const countQuery = `
                SELECT COUNT(*) AS total
                FROM lote l
                LEFT JOIN produto p ON l.id_produto = p.id_produto
                LEFT JOIN fornecedor f ON l.id_fornecedor = f.id_fornecedor
                ${whereClause}
            `;
            const [countRows] = await pool.query(countQuery, params);
            totalCount = Number(countRows[0]?.total || 0);
        }

        let query = `
            SELECT 
                l.id_lote,
                l.id_produto,
                p.nome AS nome_produto,
                l.numero_lote,
                l.dt_fabricacao,
                l.dt_validade,
                l.quantidade_inicial,
                l.id_fornecedor,
                f.nome_fornecedor
            FROM lote l
            LEFT JOIN produto p ON l.id_produto = p.id_produto
            LEFT JOIN fornecedor f ON l.id_fornecedor = f.id_fornecedor
            ${whereClause}
            ORDER BY l.id_lote DESC
        `;

        const queryParams = [...params];

        if (temPaginacao) {
            const pageNum = Math.max(1, parseInt(filtros.page, 10) || 1);
            const limitNum = Math.max(1, Math.min(100, parseInt(filtros.limit, 10) || 10));
            const offsetNum = (pageNum - 1) * limitNum;

            query += ' LIMIT ? OFFSET ?';
            queryParams.push(limitNum, offsetNum);
        }

        const [lotes] = await pool.query(query, queryParams);

        if (temPaginacao) {
            lotes.total = totalCount;
        }

        return lotes;
    }

    async listarVencendo(dias = 30) {
        const diasNum = isNaN(dias) ? 30 : Math.max(0, parseInt(dias, 10));
        const [lotes] = await pool.query(
            `SELECT 
                l.id_lote,
                l.id_produto,
                p.nome AS nome_produto,
                l.numero_lote,
                l.dt_fabricacao,
                l.dt_validade,
                l.quantidade_inicial,
                COALESCE(e.qtd_atual, 0) AS qtd_atual,
                l.id_fornecedor,
                f.nome_fornecedor,
                DATEDIFF(l.dt_validade, CURRENT_DATE) AS dias_para_vencer,
                (l.dt_validade < CURRENT_DATE) AS vencido
            FROM lote l
            LEFT JOIN produto p ON l.id_produto = p.id_produto
            LEFT JOIN fornecedor f ON l.id_fornecedor = f.id_fornecedor
            LEFT JOIN estoque e ON l.id_lote = e.id_lote
            WHERE l.dt_validade <= DATE_ADD(CURRENT_DATE, INTERVAL ? DAY)
            ORDER BY l.dt_validade ASC`,
            [diasNum]
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

    async criarComEstoque(dadosLote, dadosEstoque) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [resultadoLote] = await connection.query(
                'INSERT INTO lote SET ?',
                [dadosLote]
            );

            const idLote = resultadoLote.insertId;

            const dadosEstoqueCompleto = {
                ...dadosEstoque,
                id_lote: idLote
            };

            await connection.query(
                'INSERT INTO estoque SET ?',
                [dadosEstoqueCompleto]
            );

            await connection.commit();

            return idLote;

        } catch (erro) {
            await connection.rollback();
            throw erro;

        } finally {
            connection.release();
        }
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