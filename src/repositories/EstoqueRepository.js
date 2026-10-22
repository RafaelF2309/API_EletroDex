const pool = require('../config/database');

class EstoqueRepository {
    async listarTodos(filtros = {}) {
        const whereConditions = [];
        const params = [];

        if (filtros.id_produto) {
            whereConditions.push('e.id_produto = ?');
            params.push(Number(filtros.id_produto));
        } else if (filtros.produto) {
            if (!isNaN(filtros.produto)) {
                whereConditions.push('e.id_produto = ?');
                params.push(Number(filtros.produto));
            } else {
                whereConditions.push('p.nome LIKE ?');
                params.push(`%${filtros.produto}%`);
            }
        }

        if (filtros.id_lote) {
            whereConditions.push('e.id_lote = ?');
            params.push(Number(filtros.id_lote));
        } else if (filtros.numero_lote) {
            whereConditions.push('l.numero_lote LIKE ?');
            params.push(`%${filtros.numero_lote}%`);
        } else if (filtros.lote) {
            if (!isNaN(filtros.lote)) {
                whereConditions.push('e.id_lote = ?');
                params.push(Number(filtros.lote));
            } else {
                whereConditions.push('l.numero_lote LIKE ?');
                params.push(`%${filtros.lote}%`);
            }
        }

        if (filtros.localizacao_corredor) {
            whereConditions.push('e.localizacao_corredor = ?');
            params.push(filtros.localizacao_corredor);
        }

        if (filtros.localizacao_prateleira) {
            whereConditions.push('e.localizacao_prateleira = ?');
            params.push(filtros.localizacao_prateleira);
        }

        const whereClause = whereConditions.length > 0 ? ` WHERE ${whereConditions.join(' AND ')}` : '';

        const temPaginacao = filtros.page !== undefined || filtros.limit !== undefined;
        let totalCount = null;

        if (temPaginacao) {
            const countQuery = `
                SELECT COUNT(*) AS total
                FROM estoque e
                LEFT JOIN produto p ON e.id_produto = p.id_produto
                LEFT JOIN lote l ON e.id_lote = l.id_lote
                ${whereClause}
            `;
            const [countRows] = await pool.query(countQuery, params);
            totalCount = Number(countRows[0]?.total || 0);
        }

        let query = `
            SELECT 
                e.id_estoque,
                e.id_produto,
                e.id_lote,
                l.numero_lote,
                e.qtd_atual,
                e.localizacao_corredor,
                e.localizacao_prateleira,
                p.nome AS nome_produto,
                p.estoque_minimo
            FROM estoque e
            LEFT JOIN produto p ON e.id_produto = p.id_produto
            LEFT JOIN lote l ON e.id_lote = l.id_lote
            ${whereClause}
            ORDER BY e.id_estoque DESC
        `;

        const queryParams = [...params];

        if (temPaginacao) {
            const pageNum = Math.max(1, parseInt(filtros.page, 10) || 1);
            const limitNum = Math.max(1, Math.min(100, parseInt(filtros.limit, 10) || 10));
            const offsetNum = (pageNum - 1) * limitNum;

            query += ' LIMIT ? OFFSET ?';
            queryParams.push(limitNum, offsetNum);
        }

        const [estoques] = await pool.query(query, queryParams);

        if (temPaginacao) {
            estoques.total = totalCount;
        }

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

    async listarAjustes(filtros = {}) {
        const whereConditions = [];
        const params = [];

        const dataInicio = filtros.data_inicio || filtros.periodo_inicio;
        if (dataInicio) {
            whereConditions.push('a.ajuste_em >= ?');
            params.push(dataInicio.length === 10 ? `${dataInicio} 00:00:00` : dataInicio);
        }

        const dataFim = filtros.data_fim || filtros.periodo_fim;
        if (dataFim) {
            whereConditions.push('a.ajuste_em <= ?');
            params.push(dataFim.length === 10 ? `${dataFim} 23:59:59` : dataFim);
        }

        if (filtros.id_estoque) {
            whereConditions.push('e.id_estoque = ?');
            params.push(Number(filtros.id_estoque));
        }

        if (filtros.id_produto) {
            whereConditions.push('a.id_produto = ?');
            params.push(Number(filtros.id_produto));
        } else if (filtros.produto) {
            if (!isNaN(filtros.produto)) {
                whereConditions.push('a.id_produto = ?');
                params.push(Number(filtros.produto));
            } else {
                whereConditions.push('p.nome LIKE ?');
                params.push(`%${filtros.produto}%`);
            }
        }

        if (filtros.id_lote) {
            whereConditions.push('a.id_lote = ?');
            params.push(Number(filtros.id_lote));
        } else if (filtros.numero_lote) {
            whereConditions.push('l.numero_lote LIKE ?');
            params.push(`%${filtros.numero_lote}%`);
        } else if (filtros.lote) {
            if (!isNaN(filtros.lote)) {
                whereConditions.push('a.id_lote = ?');
                params.push(Number(filtros.lote));
            } else {
                whereConditions.push('l.numero_lote LIKE ?');
                params.push(`%${filtros.lote}%`);
            }
        }

        if (filtros.id_usuario) {
            whereConditions.push('a.id_usuario = ?');
            params.push(Number(filtros.id_usuario));
        } else if (filtros.usuario) {
            if (!isNaN(filtros.usuario)) {
                whereConditions.push('a.id_usuario = ?');
                params.push(Number(filtros.usuario));
            } else {
                whereConditions.push('u.nome LIKE ?');
                params.push(`%${filtros.usuario}%`);
            }
        }

        const whereClause = whereConditions.length > 0 ? ` WHERE ${whereConditions.join(' AND ')}` : '';

        const temPaginacao = filtros.page !== undefined || filtros.limit !== undefined;
        let totalCount = null;

        if (temPaginacao) {
            const countQuery = `
                SELECT COUNT(*) AS total
                FROM ajustes a
                INNER JOIN usuario u ON a.id_usuario = u.id_usuario
                INNER JOIN produto p ON a.id_produto = p.id_produto
                INNER JOIN lote l ON a.id_lote = l.id_lote
                LEFT JOIN estoque e ON (a.id_produto = e.id_produto AND a.id_lote = e.id_lote)
                ${whereClause}
            `;
            const [countRows] = await pool.query(countQuery, params);
            totalCount = Number(countRows[0]?.total || 0);
        }

        let query = `
            SELECT 
                a.id_ajuste,
                e.id_estoque,
                a.id_usuario,
                u.nome AS nome_usuario,
                a.id_produto,
                p.nome AS nome_produto,
                a.id_lote,
                l.numero_lote,
                a.qtd_anterior,
                a.diferenca,
                a.qtd_nova,
                a.ajuste_em,
                a.motivo
            FROM ajustes a
            INNER JOIN usuario u ON a.id_usuario = u.id_usuario
            INNER JOIN produto p ON a.id_produto = p.id_produto
            INNER JOIN lote l ON a.id_lote = l.id_lote
            LEFT JOIN estoque e ON (a.id_produto = e.id_produto AND a.id_lote = e.id_lote)
            ${whereClause}
            ORDER BY a.id_ajuste DESC
        `;

        const queryParams = [...params];

        if (temPaginacao) {
            const pageNum = Math.max(1, parseInt(filtros.page, 10) || 1);
            const limitNum = Math.max(1, Math.min(100, parseInt(filtros.limit, 10) || 10));
            const offsetNum = (pageNum - 1) * limitNum;

            query += ' LIMIT ? OFFSET ?';
            queryParams.push(limitNum, offsetNum);
        }

        const [ajustes] = await pool.query(query, queryParams);

        if (temPaginacao) {
            ajustes.total = totalCount;
        }

        return ajustes;
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
