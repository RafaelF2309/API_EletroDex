require('dotenv').config();
const app = require('./app');
const pool = require('./config/database');
const secret = process.env.JWT

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        if (!secret || secret.trim().length < 32){
            throw new Error('JWT_SECRET deve estar definido e ter pelo menos 32 caracteres')
        }
        const connection = await pool.getConnection();
        console.log('Conectado ao MySQL com sucesso!');
        connection.release();

        app.listen(PORT, () => {
            console.log(`Servidor EletroDex rodando em http://localhost:${PORT}/api`);
        });
    } catch (err) {
        console.error('Erro ao conectar no banco de dados:', err.message);
        process.exit(1);
    }
}

iniciarServidor();
