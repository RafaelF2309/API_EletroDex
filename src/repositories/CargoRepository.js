const pool = require('../config/database');

class CargoRepository {
    async listarTodos() {
<<<<<<< HEAD
        const [cargos] = await pool.query(
            'SELECT * FROM cargo ORDER BY id_cargo ASC'
        );
=======
        const [cargos] = await pool.query('SELECT * FROM cargo ORDER BY nivel_acesso DESC, nome_cargo ASC');
>>>>>>> 6336b4dfb45c281e5aea49faff9ab12de2caf7bb
        return cargos;
    }

    async buscarPorId(id) {
<<<<<<< HEAD
        const [cargos] = await pool.query(
            'SELECT * FROM cargo WHERE id_cargo = ?',
            [id]
        );
        return cargos[0];
    }

    async buscarPorNome(nome_cargo) {
        const [cargos] = await pool.query(
            'SELECT * FROM cargo WHERE nome_cargo = ?',
            [nome_cargo]
        );
=======
        const [cargos] = await pool.query('SELECT * FROM cargo WHERE id_cargo = ?', [id]);
        return cargos[0];
    }

    async buscarPorNome(nome) {
        const [cargos] = await pool.query('SELECT * FROM cargo WHERE nome_cargo = ?', [nome]);
>>>>>>> 6336b4dfb45c281e5aea49faff9ab12de2caf7bb
        return cargos[0];
    }

    async criar(dados) {
<<<<<<< HEAD
        const [resultado] = await pool.query(
            'INSERT INTO cargo SET ?',
            [dados]
        );
=======
        const [resultado] = await pool.query('INSERT INTO cargo SET ?', [dados]);
>>>>>>> 6336b4dfb45c281e5aea49faff9ab12de2caf7bb
        return resultado.insertId;
    }

    async atualizar(id, dados) {
<<<<<<< HEAD
        const [resultado] = await pool.query(
            'UPDATE cargo SET ? WHERE id_cargo = ?',
            [dados, id]
        );
=======
        const [resultado] = await pool.query('UPDATE cargo SET ? WHERE id_cargo = ?', [dados, id]);
>>>>>>> 6336b4dfb45c281e5aea49faff9ab12de2caf7bb
        return resultado.affectedRows > 0;
    }

    async remover(id) {
<<<<<<< HEAD
        const [resultado] = await pool.query(
            'DELETE FROM cargo WHERE id_cargo = ?',
            [id]
        );
=======
        const [resultado] = await pool.query('DELETE FROM cargo WHERE id_cargo = ?', [id]);
>>>>>>> 6336b4dfb45c281e5aea49faff9ab12de2caf7bb
        return resultado.affectedRows > 0;
    }
}

module.exports = new CargoRepository();
