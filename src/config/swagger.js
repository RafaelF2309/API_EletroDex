const port = process.env.PORT || 3000;

const okResponse = {
    description: 'Operação realizada com sucesso',
    content: {
        'application/json': {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
        }
    }
};

const errorResponse = {
    description: 'Erro de validação, autenticação ou recurso não encontrado',
    content: {
        'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
        }
    }
};

const authResponse = {
    description: 'Login realizado com sucesso',
    content: {
        'application/json': {
            schema: { $ref: '#/components/schemas/LoginResponse' }
        }
    }
};

const idParameter = {
    name: 'id',
    in: 'path',
    required: true,
    schema: { type: 'integer', minimum: 1 },
    description: 'Identificador do recurso'
};

const body = (schema) => ({
    required: true,
    content: {
        'application/json': {
            schema: { $ref: `#/components/schemas/${schema}` }
        }
    }
});

const secured = (operation) => ({
    ...operation,
    security: [{ bearerAuth: [] }]
});

const paths = {
    '/': {
        get: {
            tags: ['Sistema'],
            summary: 'Verificar se a API está online',
            responses: { 200: okResponse }
        }
    },
    '/api/auth/login': {
        post: {
            tags: ['Autenticação'],
            summary: 'Realizar login',
            requestBody: body('LoginRequest'),
            responses: { 200: authResponse, 400: errorResponse, 401: errorResponse }
        }
    },
    '/api/usuarios': {
        post: {
            tags: ['Usuários'],
            summary: 'Criar usuário',
            description: 'O primeiro usuário pode ser criado sem token. Depois, exige permissão de gerente.',
            requestBody: body('UsuarioRequest'),
            responses: { 201: okResponse, 400: errorResponse, 404: errorResponse, 409: errorResponse }
        },
        get: secured({
            tags: ['Usuários'],
            summary: 'Listar usuários',
            responses: { 200: okResponse, 401: errorResponse, 403: errorResponse }
        })
    },
    '/api/usuarios/{id}': {
        get: secured({
            tags: ['Usuários'],
            summary: 'Buscar usuário por ID',
            parameters: [idParameter],
            responses: { 200: okResponse, 401: errorResponse, 404: errorResponse }
        }),
        patch: secured({
            tags: ['Usuários'],
            summary: 'Atualizar usuário',
            parameters: [idParameter],
            requestBody: body('UsuarioUpdateRequest'),
            responses: { 200: okResponse, 400: errorResponse, 401: errorResponse, 403: errorResponse, 404: errorResponse }
        }),
        delete: secured({
            tags: ['Usuários'],
            summary: 'Excluir usuário',
            parameters: [idParameter],
            responses: { 200: okResponse, 401: errorResponse, 403: errorResponse, 404: errorResponse }
        })
    },
    '/api/produtos/{id}': {
        get: secured({ tags: ['Produtos'], summary: 'Buscar produto por ID', parameters: [idParameter], responses: { 200: okResponse, 401: errorResponse, 404: errorResponse } }),
        patch: secured({ tags: ['Produtos'], summary: 'Atualizar produto', parameters: [idParameter], requestBody: body('ProdutoRequest'), responses: { 200: okResponse, 400: errorResponse, 401: errorResponse } }),
        delete: secured({ tags: ['Produtos'], summary: 'Excluir produto', parameters: [idParameter], responses: { 200: okResponse, 401: errorResponse, 403: errorResponse, 404: errorResponse } })
    },
    '/api/lotes/{id}': {
        get: secured({ tags: ['Lotes'], summary: 'Buscar lote por ID', parameters: [idParameter], responses: { 200: okResponse, 401: errorResponse, 404: errorResponse } }),
        patch: secured({ tags: ['Lotes'], summary: 'Atualizar lote', parameters: [idParameter], requestBody: body('LoteRequest'), responses: { 200: okResponse, 400: errorResponse, 401: errorResponse } }),
        delete: secured({ tags: ['Lotes'], summary: 'Excluir lote', parameters: [idParameter], responses: { 200: okResponse, 401: errorResponse, 403: errorResponse, 404: errorResponse } })
    },
    '/api/estoque/{id}': {
        get: secured({ tags: ['Estoque'], summary: 'Buscar estoque por ID', parameters: [idParameter], responses: { 200: okResponse, 401: errorResponse, 404: errorResponse } }),
        patch: secured({ tags: ['Estoque'], summary: 'Atualizar estoque', parameters: [idParameter], requestBody: body('EstoqueRequest'), responses: { 200: okResponse, 400: errorResponse, 401: errorResponse } }),
        delete: secured({ tags: ['Estoque'], summary: 'Excluir estoque', parameters: [idParameter], responses: { 200: okResponse, 401: errorResponse, 403: errorResponse, 404: errorResponse } })
    },
    '/api/entrada/{id}': {
        get: secured({ tags: ['Entradas'], summary: 'Buscar entrada por ID', parameters: [idParameter], responses: { 200: okResponse, 401: errorResponse, 404: errorResponse } }),
        patch: secured({ tags: ['Entradas'], summary: 'Atualizar entrada', parameters: [idParameter], requestBody: body('MovimentacaoRequest'), responses: { 200: okResponse, 400: errorResponse, 401: errorResponse } }),
        delete: secured({ tags: ['Entradas'], summary: 'Excluir entrada', parameters: [idParameter], responses: { 200: okResponse, 401: errorResponse, 403: errorResponse, 404: errorResponse } })
    },
    '/api/saida/{id}': {
        get: secured({ tags: ['Saídas'], summary: 'Buscar saída por ID', parameters: [idParameter], responses: { 200: okResponse, 401: errorResponse, 404: errorResponse } }),
        patch: secured({ tags: ['Saídas'], summary: 'Atualizar saída', parameters: [idParameter], requestBody: body('MovimentacaoRequest'), responses: { 200: okResponse, 400: errorResponse, 401: errorResponse } }),
        delete: secured({ tags: ['Saídas'], summary: 'Excluir saída', parameters: [idParameter], responses: { 200: okResponse, 401: errorResponse, 403: errorResponse, 404: errorResponse } })
    }
};

const addCrudCollection = (path, tag, schema, options = {}) => {
    paths[path] = {
        get: secured({ tags: [tag], summary: `Listar ${tag.toLowerCase()}`, responses: { 200: okResponse, 401: errorResponse } }),
        post: secured({ tags: [tag], summary: `Criar ${tag.toLowerCase().replace(/s$/, '')}`, requestBody: body(schema), responses: { 201: okResponse, 400: errorResponse, 401: errorResponse } })
    };

    if (options.extra) {
        Object.assign(paths[path], options.extra);
    }
};

addCrudCollection('/api/produtos', 'Produtos', 'ProdutoRequest');
addCrudCollection('/api/lotes', 'Lotes', 'LoteRequest', {
    extra: {
        get: secured({ tags: ['Lotes'], summary: 'Listar lotes', responses: { 200: okResponse, 401: errorResponse } })
    }
});
addCrudCollection('/api/estoque', 'Estoque', 'EstoqueRequest');
addCrudCollection('/api/entrada', 'Entradas', 'MovimentacaoRequest');
addCrudCollection('/api/saida', 'Saídas', 'MovimentacaoRequest');
addCrudCollection('/api/fornecedores', 'Fornecedores', 'FornecedorRequest');
addCrudCollection('/api/cargos', 'Cargos', 'CargoRequest');

paths['/api/lotes/vencendo'] = {
    get: secured({ tags: ['Lotes'], summary: 'Listar lotes próximos do vencimento', responses: { 200: okResponse, 401: errorResponse } })
};
paths['/api/estoque/ajustes'] = {
    get: secured({ tags: ['Estoque'], summary: 'Listar ajustes de estoque', responses: { 200: okResponse, 401: errorResponse, 403: errorResponse } })
};
paths['/api/estoque/{id}/ajustes'] = {
    get: secured({ tags: ['Estoque'], summary: 'Listar ajustes de um estoque', parameters: [idParameter], responses: { 200: okResponse, 401: errorResponse, 403: errorResponse } })
};
paths['/api/estoque/{id}/ajuste'] = {
    post: secured({ tags: ['Estoque'], summary: 'Criar ajuste de estoque', parameters: [idParameter], requestBody: body('AjusteRequest'), responses: { 201: okResponse, 400: errorResponse, 401: errorResponse, 403: errorResponse } })
};
paths['/api/ajustes'] = {
    get: secured({ tags: ['Ajustes'], summary: 'Listar ajustes', responses: { 200: okResponse, 401: errorResponse, 403: errorResponse } })
};

module.exports = {
    openapi: '3.0.3',
    info: {
        title: 'API EletroDex',
        version: '1.0.0',
        description: 'Documentação da API de gerenciamento logístico do EletroDex.'
    },
    servers: [{ url: `http://localhost:${port}`, description: 'Servidor local' }],
    tags: [
        { name: 'Sistema' },
        { name: 'Autenticação' },
        { name: 'Usuários' },
        { name: 'Cargos' },
        { name: 'Fornecedores' },
        { name: 'Produtos' },
        { name: 'Lotes' },
        { name: 'Estoque' },
        { name: 'Entradas' },
        { name: 'Saídas' },
        { name: 'Ajustes' }
    ],
    paths,
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Informe somente o token JWT retornado pelo login.'
            }
        },
        schemas: {
            SuccessResponse: {
                type: 'object',
                properties: {
                    sucesso: { type: 'boolean', example: true },
                    mensagem: { type: 'string', example: 'Operação realizada com sucesso' },
                    dados: { type: 'object', nullable: true }
                }
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    sucesso: { type: 'boolean', example: false },
                    mensagem: { type: 'string', example: 'Token de autenticação não informado' }
                }
            },
            LoginRequest: {
                type: 'object', required: ['email', 'senha'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'admin@eletrodex.com' },
                    senha: { type: 'string', format: 'password', example: '123456' }
                }
            },
            LoginResponse: {
                type: 'object', properties: {
                    sucesso: { type: 'boolean', example: true },
                    mensagem: { type: 'string', example: 'Login realizado com sucesso' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    usuario: { type: 'object' }
                }
            },
            UsuarioRequest: {
                type: 'object', required: ['nome', 'email', 'senha', 'setor', 'id_cargo'],
                properties: {
                    nome: { type: 'string', example: 'Administrador' },
                    email: { type: 'string', format: 'email', example: 'admin@eletrodex.com' },
                    senha: { type: 'string', format: 'password', example: '123456' },
                    setor: { type: 'string', enum: ['gerencia', 'estoque', 'vendas'], example: 'gerencia' },
                    id_cargo: { type: 'integer', example: 1 }
                }
            },
            UsuarioUpdateRequest: { allOf: [{ $ref: '#/components/schemas/UsuarioRequest' }] },
            ProdutoRequest: {
                type: 'object',
                properties: {
                    nome: { type: 'string', example: 'Produto de teste' },
                    descricao: { type: 'string', example: 'Descrição do produto' },
                    estoque_minimo: { type: 'integer', example: 10 },
                    cod_barras: { type: 'string', example: '7891234567890' },
                    preco: { type: 'number', format: 'float', example: 19.9 }
                }
            },
            FornecedorRequest: { type: 'object', properties: { nome_fornecedor: { type: 'string', example: 'Fornecedor Teste' }, email: { type: 'string', format: 'email' }, telefone: { type: 'string', example: '11999999999' }, cnpj: { type: 'string', example: '12345678000199' } } },
            CargoRequest: { type: 'object', properties: { nome_cargo: { type: 'string', example: 'Estoquista' }, descricao: { type: 'string' }, nivel_acesso: { type: 'integer', example: 2 } } },
            LoteRequest: { type: 'object', properties: { id_produto: { type: 'integer', example: 1 }, numero_lote: { type: 'string', example: 'LOTE-001' }, dt_fabricacao: { type: 'string', format: 'date', example: '2026-01-01' }, dt_validade: { type: 'string', format: 'date', example: '2027-01-01' }, quantidade_inicial: { type: 'integer', example: 100 }, id_fornecedor: { type: 'integer', example: 1 } } },
            EstoqueRequest: { type: 'object', properties: { id_produto: { type: 'integer', example: 1 }, id_lote: { type: 'integer', example: 1 }, qtd_atual: { type: 'integer', example: 100 }, localizacao_corredor: { type: 'string', example: 'A' }, localizacao_prateleira: { type: 'string', example: '01' } } },
            MovimentacaoRequest: { type: 'object', properties: { id_usuario: { type: 'integer', example: 1 }, id_fornecedor: { type: 'integer', example: 1 }, id_produto: { type: 'integer', example: 1 }, id_lote: { type: 'integer', example: 1 }, data: { type: 'string', format: 'date-time' }, quantidade: { type: 'integer', example: 10 }, motivo: { type: 'string', example: 'Reposição' }, rastreamento: { type: 'string', example: 'BR123456789' } } },
            AjusteRequest: { type: 'object', properties: { diferenca: { type: 'integer', example: -2 }, motivo: { type: 'string', example: 'Contagem de inventário' } } }
        }
    }
};
