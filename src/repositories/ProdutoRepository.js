const pool = require('../config/database');

class ProdutoRepository {
    async listarTodos(filtros = {}) {
        const whereConditions = [];
        const params = [];

        if (filtros.nome) {
            whereConditions.push('p.nome LIKE ?');
            params.push(`%${filtros.nome}%`);
        }

        if (filtros.cod_barras) {
            whereConditions.push('p.cod_barras = ?');
            params.push(filtros.cod_barras);
        }

        const whereClause = whereConditions.length > 0 ? ` WHERE ${whereConditions.join(' AND ')}` : '';

        const temPaginacao = filtros.page !== undefined || filtros.limit !== undefined;
        let totalCount = null;

        if (temPaginacao) {
            const countQuery = `
                SELECT COUNT(*) AS total
                FROM produto p
                ${whereClause}
            `;
            const [countRows] = await pool.query(countQuery, params);
            totalCount = Number(countRows[0]?.total || 0);
        }

        let query = `
            SELECT 
                p.id_produto,
                p.nome,
                p.descricao,
                p.estoque_minimo,
                p.cod_barras,
                p.preco,
                p.imagem,
                CAST(COALESCE(SUM(e.qtd_atual), 0) AS SIGNED) AS qtd_atual,
                ((p.estoque_minimo > 0 AND CAST(COALESCE(SUM(e.qtd_atual), 0) AS SIGNED) <= p.estoque_minimo)
                    OR (CAST(COALESCE(SUM(e.qtd_atual), 0) AS SIGNED) < p.estoque_minimo)) AS abaixo_do_minimo
            FROM produto p
            LEFT JOIN estoque e ON p.id_produto = e.id_produto
            ${whereClause}
            GROUP BY p.id_produto, p.nome, p.descricao, p.estoque_minimo, p.cod_barras, p.preco, p.imagem
            ORDER BY p.id_produto DESC
        `;

        const queryParams = [...params];

        if (temPaginacao) {
            const pageNum = Math.max(1, parseInt(filtros.page, 10) || 1);
            const limitNum = Math.max(1, Math.min(100, parseInt(filtros.limit, 10) || 10));
            const offsetNum = (pageNum - 1) * limitNum;

            query += ' LIMIT ? OFFSET ?';
            queryParams.push(limitNum, offsetNum);
        }

        const [produtos] = await pool.query(query, queryParams);

        if (temPaginacao) {
            produtos.total = totalCount;
        }

        return produtos;
    }

    async buscarPorId(id) {
        const [produtos] = await pool.query(
            `SELECT 
                p.id_produto,
                p.nome,
                p.descricao,
                p.estoque_minimo,
                p.cod_barras,
                p.preco,
                p.imagem,
                CAST(COALESCE(SUM(e.qtd_atual), 0) AS SIGNED) AS qtd_atual,
                ((p.estoque_minimo > 0 AND CAST(COALESCE(SUM(e.qtd_atual), 0) AS SIGNED) <= p.estoque_minimo)
                    OR (CAST(COALESCE(SUM(e.qtd_atual), 0) AS SIGNED) < p.estoque_minimo)) AS abaixo_do_minimo
            FROM produto p
            LEFT JOIN estoque e ON p.id_produto = e.id_produto
            WHERE p.id_produto = ?
            GROUP BY p.id_produto, p.nome, p.descricao, p.estoque_minimo, p.cod_barras, p.preco, p.imagem`,
            [id]
        );
        return produtos[0];
    }

    async listarAbaixoDoMinimo() {
        const [produtos] = await pool.query(
            `SELECT 
                p.id_produto,
                p.nome,
                p.descricao,
                p.estoque_minimo,
                p.cod_barras,
                p.preco,
                p.imagem,
                CAST(COALESCE(SUM(e.qtd_atual), 0) AS SIGNED) AS qtd_atual,
                1 AS abaixo_do_minimo,
                GREATEST(0, CAST(p.estoque_minimo - COALESCE(SUM(e.qtd_atual), 0) AS SIGNED)) AS diferenca_para_minimo
            FROM produto p
            LEFT JOIN estoque e ON p.id_produto = e.id_produto
            GROUP BY p.id_produto, p.nome, p.descricao, p.estoque_minimo, p.cod_barras, p.preco, p.imagem
            HAVING (p.estoque_minimo > 0 AND CAST(COALESCE(SUM(e.qtd_atual), 0) AS SIGNED) <= p.estoque_minimo)
                OR (CAST(COALESCE(SUM(e.qtd_atual), 0) AS SIGNED) < p.estoque_minimo)
            ORDER BY diferenca_para_minimo DESC, p.nome ASC`
        );
        return produtos;
    }

    async buscarPorCodBarras(cod_barras) {
        const [produtos] = await pool.query(
            'SELECT * FROM produto WHERE cod_barras = ?',
            [cod_barras]
        );
        return produtos[0];
    }

    async contarDependencias(id) {
        const [resultados] = await pool.query(
            `SELECT
                (SELECT COUNT(*) FROM lote WHERE id_produto = ?) +
                (SELECT COUNT(*) FROM estoque WHERE id_produto = ?) +
                (SELECT COUNT(*) FROM entrada WHERE id_produto = ?) +
                (SELECT COUNT(*) FROM saida WHERE id_produto = ?) +
                (SELECT COUNT(*) FROM ajustes WHERE id_produto = ?) AS total`,
            [id, id, id, id, id]
        );
        return Number(resultados[0].total);
    }

    async criar(dados) {
        const [resultado] = await pool.query(
            'INSERT INTO produto SET ?',
            [dados]
        );
        return resultado.insertId;
    }

    async atualizar(id, dados) {
        const camposProduto = [];
        const valoresProduto = [];

        for (const [key, value] of Object.entries(dados)) {
            camposProduto.push(`${key} = ?`);
            valoresProduto.push(value);
        }

        if (camposProduto.length === 0) return 0;

        valoresProduto.push(id);

        const query = `UPDATE produto SET ${camposProduto.join(', ')} WHERE id_produto = ?`;

        const [resultado] = await pool.query(query, valoresProduto);

        return resultado.affectedRows;
    }

    async remover(id) {
        const [resultado] = await pool.query(
            'DELETE FROM produto WHERE id_produto = ?',
            [id]
        );
        return resultado.affectedRows > 0;
    }
}

module.exports = new ProdutoRepository();