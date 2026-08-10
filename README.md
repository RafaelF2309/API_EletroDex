# ⚡ API EletroDex — Sistema de Gerenciamento de Logística

> API RESTful desenvolvida para o controle e gerenciamento logístico de inventário, movimentação de estoque (entradas e saídas), rastreio de lotes, gestão de fornecedores e usuários.

---

## 🛠️ Tecnologias Utilizadas

* **Runtime:** Node.js (v18+)
* **Framework:** Express.js
* **Banco de Dados:** MySQL (driver `mysql2/promise`)
* **Upload de Arquivos:** Multer
* **Segurança:** Bcrypt (hashing de senhas)
* **Variáveis de Ambiente:** Dotenv

---

## 👥 Equipe de Desenvolvimento

* LAISLA BEATRIZ DO COUTO TARARAN
* MATHEUS FELIPPE DE ANDRADE
* RAFAEL FERREIRA DA SILVA
* RICARDO SILVA DA CRUZ

---

## 📁 Estrutura do Projeto

```text
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