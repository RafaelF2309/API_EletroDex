# API EletroDex

Sistema de Gerenciamento de Logística — API REST desenvolvida em **Node.js + Express + MySQL**,
seguindo a mesma arquitetura em camadas do projeto de referência **Sabor Digital**
(`config` → `repositories` → `services` → `controllers` → `routes`).

## 📁 Estrutura do projeto

```
API_EletroDex/
├── database/
│   └── schema.sql          # Script de criação das tabelas
├── src/
│   ├── config/
│   │   └── database.js     # Pool de conexão MySQL (mysql2/promise)
│   ├── repositories/        # Acesso direto ao banco (SQL puro)
│   │   ├── UsuarioRepository.js
│   │   ├── FornecedorRepository.js
│   │   ├── ProdutoRepository.js
│   │   ├── LoteRepository.js
│   │   ├── EstoqueRepository.js
│   │   ├── EntradaRepository.js
│   │   └── SaidaRepository.js
│   ├── services/            # Regras de negócio e validações
│   │   ├── UsuarioService.js
│   │   ├── FornecedorService.js
│   │   ├── ProdutoService.js
│   │   ├── LoteService.js
│   │   ├── EstoqueService.js
│   │   ├── EntradaService.js
│   │   └── SaidaService.js
│   ├── controllers/          # Camada HTTP (request/response)
│   │   ├── UsuarioController.js
│   │   ├── FornecedorController.js
│   │   ├── ProdutoController.js
│   │   ├── LoteController.js
│   │   ├── EstoqueController.js
│   │   ├── EntradaController.js
│   │   └── SaidaController.js
│   ├── routes/                # Definição das rotas Express
│   │   ├── index.js           # Agrega todas as rotas em /api
│   │   ├── usuarioRoutes.js
│   │   ├── fornecedorRoutes.js
│   │   ├── produtoRoutes.js
│   │   ├── loteRoutes.js
│   │   ├── estoqueRoutes.js
│   │   ├── entradaRoutes.js
│   │   └── saidaRoutes.js
│   ├── app.js                 # Configuração do Express (middlewares e rotas)
│   └── server.js              # Ponto de entrada — conecta no banco e sobe o servidor
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## ⚙️ Como rodar

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Criar o banco de dados**
   Execute o script `database/schema.sql` no seu MySQL:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

3. **Configurar variáveis de ambiente**
   Copie `.env.example` para `.env` e ajuste com suas credenciais:
   ```bash
   cp .env.example .env
   ```

4. **Rodar o servidor**
   ```bash
   npm start
   ```
   ou, em modo desenvolvimento (reinicia sozinho a cada alteração):
   ```bash
   npm install -g nodemon   # se ainda não tiver
   npm run dev
   ```

5. A API sobe em `http://localhost:3000/api` (Base URL igual à da documentação).

## 🔗 Rotas disponíveis

Todas as rotas abaixo ficam sob o prefixo `/api`.

| Recurso | Rotas |
|---|---|
| Usuários | `GET /usuarios`, `GET /usuarios/:id`, `POST /usuarios`, `PATCH /usuarios/:id`, `DELETE /usuarios/:id` |
| Fornecedores | `GET /fornecedores`, `GET /fornecedores/:id`, `POST /fornecedores`, `PATCH /fornecedores/:id`, `DELETE /fornecedores/:id` |
| Produtos | `GET /produtos`, `GET /produtos/:id`, `POST /produtos`, `PATCH /produtos/:id`, `DELETE /produtos/:id` |
| Lotes | `GET /lotes`, `GET /lotes/:id`, `POST /lotes`, `PATCH /lotes/:id`, `DELETE /lotes/:id` |
| Estoque | `GET /estoque`, `GET /estoque/:id`, `POST /estoque`, `PATCH /estoque/:id`, `DELETE /estoque/:id` |
| Entrada | `GET /entrada`, `GET /entrada/:id`, `POST /entrada`, `PATCH /entrada/:id`, `DELETE /entrada/:id` |
| Saída | `GET /saida`, `GET /saida/:id`, `POST /saida`, `PATCH /saida/:id`, `DELETE /saida/:id` |

### Exemplo — cadastrar usuário

```
POST /api/usuarios
Content-Type: application/json

{
  "nome": "Ana Costa",
  "email": "ana@email.com",
  "senha": "LoR999*",
  "setor": "Diretoria",
  "cargo": "Diretora"
}
```

Resposta (201 Created):
```json
{
  "sucesso": true,
  "mensagem": "Usuário cadastrado com sucesso",
  "dados": {
    "id_usuario": 1,
    "nome": "Ana Costa",
    "dt_cadastro": "2026-05-08",
    "email": "ana@email.com",
    "setor": "Diretoria",
    "cargo": "Diretora"
  }
}
```

## 🧱 Padrão de resposta

Todas as respostas seguem o formato:
```json
{ "sucesso": true, "dados": {...} }
```
ou, em caso de erro:
```json
{ "sucesso": false, "mensagem": "descrição do erro" }
```

## 🔧 O que foi corrigido em relação ao projeto de referência

Ao adaptar a arquitetura do **Sabor Digital**, alguns problemas encontrados no projeto original
foram corrigidos aqui:
- Separação real em camadas (o Sabor Digital tinha rotas escritas direto no `app.js`, junto com
  chamadas soltas ao repository/service que não se conectavam de fato).
- Uso consistente de `async/await` em todas as camadas (o service de referência tinha métodos
  declarados sem `async` mas usando `await` dentro, o que gera erro de sintaxe).
- Correção de nomes de tabela/coluna inconsistentes (ex.: `produto` vs `produtos`).
- Padronização das respostas de erro com `status` e `mensagem` tratados centralmente no controller.
