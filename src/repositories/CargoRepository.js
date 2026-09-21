const pool = require('../config/database');

class CargoRepository {
    async listarTodos() {
        const [cargos] = await pool.query('SELECT * FROM cargo ORDER BY nivel_acesso DESC, nome_cargo ASC');
        return cargos;
    }

    async buscarPorId(id) {
        const [cargos] = await pool.query('SELECT * FROM cargo WHERE id_cargo = ?', [id]);
        return cargos[0];
    }

    async buscarPorNome(nome) {
        const [cargos] = await pool.query('SELECT * FROM cargo WHERE nome_cargo = ?', [nome]);
        return cargos[0];
    }

    async criar(dados) {
        const [resultado] = await pool.query('INSERT INTO cargo SET ?', [dados]);
        return resultado.insertId;
    }

    async atualizar(id, dados) {
        const [resultado] = await pool.query('UPDATE cargo SET ? WHERE id_cargo = ?', [dados, id]);
        return resultado.affectedRows > 0;
    }

    async remover(id) {
        const [resultado] = await pool.query('DELETE FROM cargo WHERE id_cargo = ?', [id]);
        return resultado.affectedRows > 0;
    }
}

module.exports = new CargoRepository();
