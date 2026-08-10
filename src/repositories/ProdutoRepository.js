const pool = require('../config/database');

class ProdutoRepository {
    async listarTodos() {
        const [produtos] = await pool.query(
            'SELECT * FROM produto ORDER BY id_produto DESC'
        );
        return produtos;
    }

    async buscarPorId(id) {
        const [produtos] = await pool.query(
            'SELECT * FROM produto WHERE id_produto = ?',
            [id]
        );
        return produtos[0];
    }

    async buscarPorCodBarras(cod_barras) {
        const [produtos] = await pool.query(
            'SELECT * FROM produto WHERE cod_barras = ?',
            [cod_barras]
        );
        return produtos[0];
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