require('dotenv').config();
const app = require('./app');
const pool = require('./config/database');
const { getJwtSecret } = require('./config/auth');

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        getJwtSecret();
        const connection = await pool.getConnection();
        console.log('Conectado ao MySQL com sucesso!');
        connection.release();

        app.listen(PORT, () => {
            console.log(`Servidor EletroDex rodando em http://localhost:${PORT}/api`);
        });
    } catch (err) {
        console.error('Erro ao iniciar a aplicação:', err.message);
        process.exit(1);
    }
}

iniciarServidor();