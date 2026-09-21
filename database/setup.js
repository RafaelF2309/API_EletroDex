const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setup() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
  };

  console.log('Tentando conectar ao MySQL com a seguinte configuração:');
  console.log(`Host: ${config.host}`);
  console.log(`User: ${config.user}`);
  console.log(`Port: ${config.port}`);
  console.log(`Password: ${config.password ? '***' : '(vazio)'}`);

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('Conexão estabelecida com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao MySQL:', error.message);
    console.log('Tentando conectar com senha vazia...');
    try {
      config.password = '';
      connection = await mysql.createConnection(config);
      console.log('Conexão estabelecida com sucesso usando senha vazia!');
      
      // Update .env file to use empty password
      const envPath = path.join(__dirname, '../.env');
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = envContent.replace(/DB_PASSWORD=.*/, 'DB_PASSWORD=');
        fs.writeFileSync(envPath, envContent, 'utf8');
        console.log('Atualizado arquivo .env para usar senha vazia.');
      }
    } catch (innerError) {
      console.error('Erro ao conectar com senha vazia também:', innerError.message);
      console.log('Certifique-se de que o MySQL está rodando e as credenciais no arquivo .env estão corretas.');
      process.exit(1);
    }
  }

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error(`Arquivo schema.sql não encontrado em: ${schemaPath}`);
      process.exit(1);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split queries by semicolon followed by newline
    const queries = schemaSql
      .split(/;\s*$/m)
      .map(q => q.trim())
      .filter(q => q.length > 0);

    console.log(`Executando ${queries.length} comandos SQL do schema.sql...`);

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      try {
        await connection.query(query);
      } catch (qErr) {
        console.error(`Erro ao executar comando ${i + 1}:`, qErr.message);
        console.log('Comando falhado:', query);
        throw qErr;
      }
    }

    console.log('Banco de dados e tabelas criados com sucesso!');
  } catch (err) {
    console.error('Erro durante a execução do script SQL:', err.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setup();