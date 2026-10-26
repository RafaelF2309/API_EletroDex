# ⚡ API EletroDex — Sistema de Gerenciamento de Logística

> API RESTful desenvolvida para o controle e gerenciamento logístico de inventário, movimentação de estoque (entradas e saídas), rastreio de lotes, gestão de fornecedores e usuários.

---

## 🛠️ Tecnologias Utilizadas

- **Runtime:** Node.js (v18+)

- **Framework:** Express.js

- **Banco de Dados:** MySQL (driver `mysql2/promise`)

- **Upload de Arquivos:** Multer

- **Segurança:** Bcrypt (hashing de senhas)

- **Variáveis de Ambiente:** Dotenv

---

## ⚙️ Configuração local

1. Crie o banco e as tabelas executando `database/schema.sql` no MySQL.

1. Copie `.env.example` para `.env`.

1. Preencha `DB_USER` e `DB_PASSWORD` com um usuário do MySQL. Em uma instalação local padrão, `DB_USER=root` pode ser usado; deixe `DB_PASSWORD` vazio somente se o usuário `root` não tiver senha.

1. Gere um `JWT_SECRET` próprio para cada ambiente.

O arquivo `.env` é local e não deve ser enviado ao Git. Se a aplicação informar `Access denied for user ''@'localhost'`, verifique se `DB_USER` não está vazio no `.env`.

### Swagger

Com a API em execução, acesse a documentação interativa em:

```
http://localhost:3000/api-docs
```

Para verificar se a API está no ar, acesse `http://localhost:3000/api`. Essa rota retorna uma confirmação de que o servidor está funcionando.

Para testar rotas protegidas, faça login pelo endpoint `POST /api/auth/login`, copie o token retornado, clique em **Authorize** no Swagger e informe apenas o token JWT. A interface adicionará automaticamente o prefixo `Bearer` nas requisições autenticadas.

---

## 👥 Equipe de Desenvolvimento

- LAISLA BEATRIZ DO COUTO TARARAN

- MATHEUS FELIPPE DE ANDRADE

- RAFAEL FERREIRA DA SILVA

- RICARDO SILVA DA CRUZ

---

## 📁 Estrutura do Projeto

```
API_EletroDex/
├── database/
│   └── schema.sql              # Scripts DDL de criação das tabelas e do banco
├── uploads/                    # Armazenamento de arquivos de mídia (gerado via Multer)
├── src/
│   ├── config/                 # Configurações de conexões e bibliotecas
│   │   ├── database.js         # Conexão e pool com MySQL (mysql2/promise)
│   │   └── multer.js           # Configuração de upload de arquivos
│   ├── controllers/            # Tratamento de requisições e respostas HTTP
│   │   ├── EntradaController.js
│   │   ├── EstoqueController.js
│   │   ├── FornecedorController.js
│   │   ├── LoteController.js
│   │   ├── ProdutoController.js
│   │   ├── SaidaController.js
│   │   └── UsuarioController.js
│   ├── middlewares/            # Middlewares intermediários do Express
│   │   └── errorHandler.js     # Tratamento centralizado de erros
│   ├── repositories/           # Camada de persistência (Consultas SQL)
│   │   ├── EntradaRepository.js
│   │   ├── EstoqueRepository.js
│   │   ├── FornecedorRepository.js
│   │   ├── LoteRepository.js
│   │   ├── ProdutoRepository.js
│   │   ├── SaidaRepository.js
│   │   └── UsuarioRepository.js
│   ├── routes/                 # Definição das rotas e endpoints
│   │   ├── entradaRoutes.js
│   │   ├── estoqueRoutes.js
│   │   ├── fornecedorRoutes.js
│   │   ├── index.js            # Agregador de rotas principais (/api)
│   │   ├── loteRoutes.js
│   │   ├── produtoRoutes.js
│   │   ├── saidaRoutes.js
│   │   └── usuarioRoutes.js
│   ├── services/               # Regras de negócio, validações e hashes
│   │   ├── EntradaService.js
│   │   ├── EstoqueService.js
│   │   ├── FornecedorService.js
│   │   ├── LoteService.js
│   │   ├── ProdutoService.js
│   │   ├── SaidaService.js
│   │   └── UsuarioService.js
│   ├── app.js                  # Instância e middlewares do Express
│   └── server.js               # Ponto de entrada para inicialização do servidor
├── .env                        # Variáveis de ambiente (não versionado)
├── .env.example                # Modelo de variáveis de ambiente
├── .gitignore                  # Regras de exclusão do Git
├── package.json                # Gerenciador de dependências e scripts
└── README.md                   # Documentação da API
```