const pool = require('../config/database');

class SaidaRepository {
    async listarTodos(filtros = {}) {
        const whereConditions = [];
        const params = [];

        const dataInicio = filtros.data_inicio || filtros.periodo_inicio;
        if (dataInicio) {
            whereConditions.push('s.data >= ?');
            params.push(dataInicio.length === 10 ? `${dataInicio} 00:00:00` : dataInicio);
        }

        const dataFim = filtros.data_fim || filtros.periodo_fim;
        if (dataFim) {
            whereConditions.push('s.data <= ?');
            params.push(dataFim.length === 10 ? `${dataFim} 23:59:59` : dataFim);
        }

        if (filtros.id_produto) {
            whereConditions.push('s.id_produto = ?');
            params.push(Number(filtros.id_produto));
        } else if (filtros.produto) {
            if (!isNaN(filtros.produto)) {
                whereConditions.push('s.id_produto = ?');
                params.push(Number(filtros.produto));
            } else {
                whereConditions.push('p.nome LIKE ?');
                params.push(`%${filtros.produto}%`);
            }
        }

        if (filtros.id_lote) {
            whereConditions.push('s.id_lote = ?');
            params.push(Number(filtros.id_lote));
        } else if (filtros.numero_lote) {
            whereConditions.push('l.numero_lote LIKE ?');
            params.push(`%${filtros.numero_lote}%`);
        } else if (filtros.lote) {
            if (!isNaN(filtros.lote)) {
                whereConditions.push('s.id_lote = ?');
                params.push(Number(filtros.lote));
            } else {
                whereConditions.push('l.numero_lote LIKE ?');
                params.push(`%${filtros.lote}%`);
            }
        }

        if (filtros.motivo) {
            whereConditions.push('s.motivo LIKE ?');
            params.push(`%${filtros.motivo}%`);
        }

        if (filtros.id_usuario) {
            whereConditions.push('s.id_usuario = ?');
            params.push(Number(filtros.id_usuario));
        }

        if (filtros.id_fornecedor) {
            whereConditions.push('l.id_fornecedor = ?');
            params.push(Number(filtros.id_fornecedor));
        }

        const whereClause = whereConditions.length > 0 ? ` WHERE ${whereConditions.join(' AND ')}` : '';

        const temPaginacao = filtros.page !== undefined || filtros.limit !== undefined;
        let totalCount = null;

        if (temPaginacao) {
            const countQuery = `
                SELECT COUNT(*) AS total
                FROM saida s
                LEFT JOIN usuario u ON s.id_usuario = u.id_usuario
                LEFT JOIN produto p ON s.id_produto = p.id_produto
                LEFT JOIN lote l ON s.id_lote = l.id_lote
                LEFT JOIN fornecedor f ON l.id_fornecedor = f.id_fornecedor
                ${whereClause}
            `;
            const [countRows] = await pool.query(countQuery, params);
            totalCount = Number(countRows[0]?.total || 0);
        }

        let query = `
            SELECT 
                s.id_saida,
                s.id_usuario,
                u.nome AS nome_usuario,
                s.id_produto,
                p.nome AS nome_produto,
                p.preco AS preco_produto,
                s.id_lote,
                l.numero_lote,
                f.nome_fornecedor,
                s.data,
                s.quantidade,
                s.motivo,
                s.rastreamento
            FROM saida s
            LEFT JOIN usuario u ON s.id_usuario = u.id_usuario
            LEFT JOIN produto p ON s.id_produto = p.id_produto
            LEFT JOIN lote l ON s.id_lote = l.id_lote
            LEFT JOIN fornecedor f ON l.id_fornecedor = f.id_fornecedor
            ${whereClause}
            ORDER BY s.id_saida DESC
        `;

        const queryParams = [...params];

        if (temPaginacao) {
            const pageNum = Math.max(1, parseInt(filtros.page, 10) || 1);
            const limitNum = Math.max(1, Math.min(100, parseInt(filtros.limit, 10) || 10));
            const offsetNum = (pageNum - 1) * limitNum;

            query += ' LIMIT ? OFFSET ?';
            queryParams.push(limitNum, offsetNum);
        }

        const [saidas] = await pool.query(query, queryParams);

        if (temPaginacao) {
            saidas.total = totalCount;
        }

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
