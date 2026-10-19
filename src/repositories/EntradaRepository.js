const pool = require('../config/database');

class EntradaRepository {
    async listarTodos(filtros = {}) {
        const whereConditions = [];
        const params = [];

        const dataInicio = filtros.data_inicio || filtros.periodo_inicio;
        if (dataInicio) {
            whereConditions.push('e.data >= ?');
            params.push(dataInicio.length === 10 ? `${dataInicio} 00:00:00` : dataInicio);
        }

        const dataFim = filtros.data_fim || filtros.periodo_fim;
        if (dataFim) {
            whereConditions.push('e.data <= ?');
            params.push(dataFim.length === 10 ? `${dataFim} 23:59:59` : dataFim);
        }

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

        if (filtros.id_usuario) {
            whereConditions.push('e.id_usuario = ?');
            params.push(Number(filtros.id_usuario));
        }

        if (filtros.id_fornecedor) {
            whereConditions.push('e.id_fornecedor = ?');
            params.push(Number(filtros.id_fornecedor));
        }

        const whereClause = whereConditions.length > 0 ? ` WHERE ${whereConditions.join(' AND ')}` : '';

        const temPaginacao = filtros.page !== undefined || filtros.limit !== undefined;
        let totalCount = null;

        if (temPaginacao) {
            const countQuery = `
                SELECT COUNT(*) AS total
                FROM entrada e
                LEFT JOIN usuario u ON e.id_usuario = u.id_usuario
                LEFT JOIN fornecedor f ON e.id_fornecedor = f.id_fornecedor
                LEFT JOIN produto p ON e.id_produto = p.id_produto
                LEFT JOIN lote l ON e.id_lote = l.id_lote
                ${whereClause}
            `;
            const [countRows] = await pool.query(countQuery, params);
            totalCount = Number(countRows[0]?.total || 0);
        }

        let query = `
            SELECT 
                e.id_entrada,
                e.id_usuario,
                u.nome AS nome_usuario,
                e.id_fornecedor,
                f.nome_fornecedor,
                e.id_produto,
                p.nome AS nome_produto,
                e.id_lote,
                l.numero_lote,
                e.data,
                e.quantidade,
                e.rastreamento
            FROM entrada e
            LEFT JOIN usuario u ON e.id_usuario = u.id_usuario
            LEFT JOIN fornecedor f ON e.id_fornecedor = f.id_fornecedor
            LEFT JOIN produto p ON e.id_produto = p.id_produto
            LEFT JOIN lote l ON e.id_lote = l.id_lote
            ${whereClause}
            ORDER BY e.id_entrada DESC
        `;

        const queryParams = [...params];

        if (temPaginacao) {
            const pageNum = Math.max(1, parseInt(filtros.page, 10) || 1);
            const limitNum = Math.max(1, Math.min(100, parseInt(filtros.limit, 10) || 10));
            const offsetNum = (pageNum - 1) * limitNum;

            query += ' LIMIT ? OFFSET ?';
            queryParams.push(limitNum, offsetNum);
        }

        const [entradas] = await pool.query(query, queryParams);

        if (temPaginacao) {
            entradas.total = totalCount;
        }

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
