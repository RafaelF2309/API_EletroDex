/**
 * Testes de Integração Real - Fluxo Completo de Estoque
 *
 * Estes testes NÃO usam jest.mock nos repositórios.
 * Eles batem diretamente no banco MySQL de teste configurado em .env.
 *
 * Pré-requisitos:
 *   - MySQL rodando
 *   - Variáveis de ambiente configuradas no .env
 *   - O banco de teste deve ter o schema aplicado
 *
 * Cobertura:
 *   1. Criar entidades base
 *   2. Dar entrada → conferir qtd_atual sobe
 *   3. Dar saída → conferir qtd_atual desce
 *   4. Bloquear saída com estoque insuficiente
 *   5. Bloquear saída de lote vencido
 *   6. Remover entrada → conferir remoção
 *   7. Remover saída → conferir estorno do estoque
 *   8. Ajustar estoque com auditoria
 *   9. Consultar histórico de ajustes
 *  10. Listar lotes vencendo
 */

const pool = require('../../src/config/database');
const EntradaService = require('../../src/services/EntradaService');
const SaidaService = require('../../src/services/SaidaService');
const EstoqueService = require('../../src/services/EstoqueService');
const LoteService = require('../../src/services/LoteService');
const bcrypt = require('bcrypt');

// ─── Helpers ────────────────────────────────────────────────────────────────

async function query(sql, params = []) {
    const [rows] = await pool.query(sql, params);
    return rows;
}

async function cleanup(conn) {
    const c = conn || pool;

    await c.query('DELETE FROM ajustes');
    await c.query('DELETE FROM saida');
    await c.query('DELETE FROM entrada');
    await c.query('DELETE FROM estoque');
    await c.query('DELETE FROM lote');
    await c.query('DELETE FROM produto');
    await c.query('DELETE FROM usuario');
    await c.query('DELETE FROM fornecedor');

    await c.query(
        "DELETE FROM cargo WHERE nome_cargo NOT IN ('Gerente','Estoquista','Vendedor')"
    );
}

// ─── Setup global ────────────────────────────────────────────────────────────

let idCargo;
let idUsuario;
let idFornecedor;
let idProduto;
let idLote;
let idEstoque;
let idLoteVencido;

beforeAll(async () => {
    await cleanup();

    // Cargo
    const [cargos] = await pool.query(
        "SELECT id_cargo FROM cargo WHERE nome_cargo = 'Gerente' LIMIT 1"
    );

    if (!cargos.length) {
        throw new Error(
            'Cargo "Gerente" não encontrado. Execute o schema primeiro.'
        );
    }

    idCargo = cargos[0].id_cargo;

    // Usuário
    const senha = await bcrypt.hash('Senha@123', 10);

    const [uRes] = await pool.query(
        `INSERT INTO usuario
        (nome, email, senha, setor, id_cargo)
        VALUES (?, ?, ?, 'gerencia', ?)`,
        [
            'Teste Integração',
            'integracao@test.local',
            senha,
            idCargo
        ]
    );

    idUsuario = uRes.insertId;

    // Fornecedor
    const [fRes] = await pool.query(
        `INSERT INTO fornecedor
        (nome_fornecedor, email, telefone, cnpj)
        VALUES (?, ?, ?, ?)`,
        [
            'Fornecedor Teste',
            'forn@test.local',
            '11999990000',
            '00000000000191'
        ]
    );

    idFornecedor = fRes.insertId;

    // Produto
    const [pRes] = await pool.query(
        `INSERT INTO produto
        (nome, estoque_minimo, cod_barras, preco)
        VALUES (?, ?, ?, ?)`,
        [
            'Produto Teste',
            5,
            'BARRAS-INT-001',
            29.90
        ]
    );

    idProduto = pRes.insertId;

    // Lote válido
    const [lRes] = await pool.query(
        `INSERT INTO lote
        (
            id_produto,
            numero_lote,
            dt_fabricacao,
            dt_validade,
            quantidade_inicial,
            id_fornecedor
        )
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            idProduto,
            'LOTE-INT-001',
            '2026-01-01',
            '2099-12-31',
            100,
            idFornecedor
        ]
    );

    idLote = lRes.insertId;

    // Lote vencido
    const [lvRes] = await pool.query(
        `INSERT INTO lote
        (
            id_produto,
            numero_lote,
            dt_fabricacao,
            dt_validade,
            quantidade_inicial,
            id_fornecedor
        )
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            idProduto,
            'LOTE-VENCIDO-001',
            '2020-01-01',
            '2020-06-01',
            50,
            idFornecedor
        ]
    );

    idLoteVencido = lvRes.insertId;

    // Estoque do lote válido
    const [eRes] = await pool.query(
        `INSERT INTO estoque
        (
            id_produto,
            id_lote,
            qtd_atual,
            localizacao_corredor,
            localizacao_prateleira
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
            idProduto,
            idLote,
            100,
            'A',
            '1'
        ]
    );

    idEstoque = eRes.insertId;

    // Estoque do lote vencido
    await pool.query(
        `INSERT INTO estoque
        (
            id_produto,
            id_lote,
            qtd_atual,
            localizacao_corredor,
            localizacao_prateleira
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
            idProduto,
            idLoteVencido,
            10,
            'B',
            '2'
        ]
    );
});

afterAll(async () => {
    await cleanup();
    await pool.end();
});

// ─── Helper para ler qtd_atual ────────────────────────────────────────────────

async function qtdAtual(id_estoque) {
    const [rows] = await pool.query(
        'SELECT qtd_atual FROM estoque WHERE id_estoque = ?',
        [id_estoque]
    );

    return rows[0]?.qtd_atual ?? null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLUXO: ENTRADA → SAÍDA → ESTORNO
// ═══════════════════════════════════════════════════════════════════════════════

describe('[Integração Real] Fluxo de Estoque', () => {

    // ─────────────────────────────────────────────────────────────────────────
    // 1. ENTRADA
    // ─────────────────────────────────────────────────────────────────────────

    describe('1. criarEntrada', () => {
        let idEntradaCriada;

        test('deve registrar entrada e aumentar qtd_atual', async () => {
            const antes = await qtdAtual(idEstoque);

            const res = await EntradaService.criarEntrada({
                id_usuario: idUsuario,
                id_fornecedor: idFornecedor,
                id_produto: idProduto,
                id_lote: idLote,
                data: '2026-03-01 10:00:00',
                quantidade: 20
            });

            idEntradaCriada = res.dados.id_entrada;

            expect(res.sucesso).toBe(true);
            expect(res.dados.quantidade).toBe(20);

            const depois = await qtdAtual(idEstoque);

            expect(depois).toBe(antes + 20);
        });

        test('deve registrar segunda entrada acumulando no estoque', async () => {
            const antes = await qtdAtual(idEstoque);

            await EntradaService.criarEntrada({
                id_usuario: idUsuario,
                id_fornecedor: idFornecedor,
                id_produto: idProduto,
                id_lote: idLote,
                data: '2026-03-02 10:00:00',
                quantidade: 30
            });

            const depois = await qtdAtual(idEstoque);

            expect(depois).toBe(antes + 30);
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 2. SAÍDA
    // ─────────────────────────────────────────────────────────────────────────

    describe('2. criarSaida', () => {
        let idSaidaCriada;

        test('deve registrar saída e diminuir qtd_atual', async () => {
            const antes = await qtdAtual(idEstoque);

            const res = await SaidaService.criarSaida({
                id_usuario: idUsuario,
                id_produto: idProduto,
                id_lote: idLote,
                data: '2026-03-03 14:00:00',
                quantidade: 15,
                motivo: 'venda'
            });

            idSaidaCriada = res.dados.id_saida;

            expect(res.sucesso).toBe(true);
            expect(res.dados.quantidade).toBe(15);

            const depois = await qtdAtual(idEstoque);

            expect(depois).toBe(antes - 15);
        });

        test('deve rejeitar saída com estoque insuficiente', async () => {
            const qtd = await qtdAtual(idEstoque);

            await expect(
                SaidaService.criarSaida({
                    id_usuario: idUsuario,
                    id_produto: idProduto,
                    id_lote: idLote,
                    data: '2026-03-04 10:00:00',
                    quantidade: qtd + 9999,
                    motivo: 'venda'
                })
            ).rejects.toMatchObject({
                status: 400
            });

            expect(await qtdAtual(idEstoque)).toBe(qtd);
        });

        test('deve rejeitar saída de lote vencido', async () => {
            await expect(
                SaidaService.criarSaida({
                    id_usuario: idUsuario,
                    id_produto: idProduto,
                    id_lote: idLoteVencido,
                    data: '2026-03-04 10:00:00',
                    quantidade: 1,
                    motivo: 'consumo'
                })
            ).rejects.toEqual({
                status: 400,
                mensagem: 'Não é permitido registrar saída de lote vencido'
            });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 3. REMOÇÃO DE SAÍDA → ESTORNO
    // ─────────────────────────────────────────────────────────────────────────

    describe('3. removerSaida (estorno)', () => {
        let idSaidaTemp;

        beforeAll(async () => {
            const res = await SaidaService.criarSaida({
                id_usuario: idUsuario,
                id_produto: idProduto,
                id_lote: idLote,
                data: '2026-03-05 10:00:00',
                quantidade: 5,
                motivo: 'perda'
            });

            idSaidaTemp = res.dados.id_saida;
        });

        test('deve estornar qtd_atual ao remover saída', async () => {
            const antes = await qtdAtual(idEstoque);

            const res = await SaidaService.removerSaida(idSaidaTemp);

            expect(res.sucesso).toBe(true);
            expect(res.mensagem).toBe(
                'Movimentação de saída removida com sucesso'
            );

            const depois = await qtdAtual(idEstoque);

            expect(depois).toBe(antes + 5);

            // Confirma que a saída realmente foi removida
            const [rows] = await pool.query(
                'SELECT * FROM saida WHERE id_saida = ?',
                [idSaidaTemp]
            );

            expect(rows.length).toBe(0);
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 4. REMOÇÃO DE ENTRADA
    // ─────────────────────────────────────────────────────────────────────────

    describe('4. removerEntrada', () => {
        let idEntradaTemp;

        beforeAll(async () => {
            const res = await EntradaService.criarEntrada({
                id_usuario: idUsuario,
                id_fornecedor: idFornecedor,
                id_produto: idProduto,
                id_lote: idLote,
                data: '2026-03-06 08:00:00',
                quantidade: 7
            });

            idEntradaTemp = res.dados.id_entrada;
        });

        test('deve remover entrada sem erros', async () => {
            const res =
                await EntradaService.removerEntrada(idEntradaTemp);

            expect(res.sucesso).toBe(true);

            const [rows] = await pool.query(
                'SELECT * FROM entrada WHERE id_entrada = ?',
                [idEntradaTemp]
            );

            expect(rows.length).toBe(0);
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 5. AJUSTE COM AUDITORIA
    // ─────────────────────────────────────────────────────────────────────────

    describe('5. ajustarEstoque (com auditoria)', () => {

        test('deve gravar ajuste e alterar qtd_atual', async () => {
            const antes = await qtdAtual(idEstoque);

            const res = await EstoqueService.ajustarEstoque(
                idEstoque,
                {
                    diferenca: -3,
                    motivo: 'Correção de inventário'
                },
                idUsuario
            );

            expect(res.sucesso).toBe(true);

            expect(res.dados.estoque.qtd_atual)
                .toBe(antes - 3);

            const depois = await qtdAtual(idEstoque);

            expect(depois).toBe(antes - 3);

            const [ajustes] = await pool.query(
                `SELECT *
                 FROM ajustes
                 WHERE id_produto = ?
                   AND id_lote = ?
                 ORDER BY id_ajuste DESC
                 LIMIT 1`,
                [idProduto, idLote]
            );

            expect(ajustes.length).toBeGreaterThan(0);

            expect(Number(ajustes[0].diferenca))
                .toBe(-3);

            expect(ajustes[0].motivo)
                .toBe('Correção de inventário');

            expect(Number(ajustes[0].qtd_nova))
                .toBe(antes - 3);
        });

        test('deve rejeitar ajuste que deixaria estoque negativo', async () => {
            const qtd = await qtdAtual(idEstoque);

            await expect(
                EstoqueService.ajustarEstoque(
                    idEstoque,
                    {
                        diferenca: -(qtd + 1),
                        motivo: 'Teste negativo'
                    },
                    idUsuario
                )
            ).rejects.toMatchObject({
                status: 400
            });

            expect(await qtdAtual(idEstoque))
                .toBe(qtd);
        });

        test('deve rejeitar ajuste com diferenca zero', async () => {
            await expect(
                EstoqueService.ajustarEstoque(
                    idEstoque,
                    {
                        diferenca: 0,
                        motivo: 'Teste zero'
                    },
                    idUsuario
                )
            ).rejects.toMatchObject({
                status: 400
            });
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 6. HISTÓRICO DE AJUSTES
    // ─────────────────────────────────────────────────────────────────────────

    describe('6. listarAjustesPorEstoque', () => {

        test('deve retornar histórico de ajustes do estoque', async () => {
            const res =
                await EstoqueService.listarAjustesPorEstoque(idEstoque);

            expect(res.sucesso).toBe(true);
            expect(Array.isArray(res.dados)).toBe(true);
            expect(res.dados.length).toBeGreaterThan(0);

            const ajuste = res.dados[0];

            expect(ajuste).toHaveProperty('id_ajuste');
            expect(ajuste).toHaveProperty('nome_usuario');
            expect(ajuste).toHaveProperty('nome_produto');
            expect(ajuste).toHaveProperty('numero_lote');
            expect(ajuste).toHaveProperty('qtd_anterior');
            expect(ajuste).toHaveProperty('diferenca');
            expect(ajuste).toHaveProperty('qtd_nova');
            expect(ajuste).toHaveProperty('motivo');

            expect(typeof ajuste.qtd_anterior)
                .toBe('number');

            expect(typeof ajuste.diferenca)
                .toBe('number');

            expect(typeof ajuste.qtd_nova)
                .toBe('number');
        });

        test('deve retornar 404 para estoque inexistente', async () => {
            await expect(
                EstoqueService.listarAjustesPorEstoque(999999)
            ).rejects.toMatchObject({
                status: 404
            });
        });

        test('deve filtrar ajustes por período', async () => {
            const res =
                await EstoqueService.listarAjustesPorEstoque(
                    idEstoque,
                    {
                        data_inicio: '2000-01-01',
                        data_fim: '2099-12-31'
                    }
                );

            expect(res.sucesso).toBe(true);
            expect(res.dados.length).toBeGreaterThan(0);
        });

        test('deve suportar paginação', async () => {
            const res =
                await EstoqueService.listarAjustesPorEstoque(
                    idEstoque,
                    {
                        page: 1,
                        limit: 1
                    }
                );

            expect(res.sucesso).toBe(true);
            expect(res.dados.length).toBeLessThanOrEqual(1);

            expect(res).toHaveProperty('pagina', 1);
            expect(res).toHaveProperty('limite', 1);
            expect(res).toHaveProperty('total');
            expect(res).toHaveProperty('total_paginas');
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 7. LOTES VENCENDO
    // ─────────────────────────────────────────────────────────────────────────

    describe('7. listarLotesVencendo', () => {

        test('deve listar lote que vence em breve', async () => {
            const res =
                await LoteService.listarLotesVencendo(99999);

            expect(res.sucesso).toBe(true);
            expect(Array.isArray(res.dados)).toBe(true);

            const numeros =
                res.dados.map(l => l.numero_lote);

            expect(numeros)
                .not
                .toContain('LOTE-VENCIDO-001');
        });

        test('deve rejeitar dias inválido (string não numérica)', async () => {
            await expect(
                LoteService.listarLotesVencendo('abc')
            ).rejects.toMatchObject({
                status: 400
            });
        });

        test('deve retornar estrutura correta nos lotes vencendo', async () => {
            const res =
                await LoteService.listarLotesVencendo(99999);

            expect(res.sucesso).toBe(true);

            if (res.dados.length > 0) {
                const lote = res.dados[0];

                expect(lote)
                    .toHaveProperty('numero_lote');

                expect(lote)
                    .toHaveProperty('dt_validade');
            }
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 8. INTEGRIDADE GERAL
    // ─────────────────────────────────────────────────────────────────────────

    describe('8. Integridade do banco', () => {

        test('qtd_atual em todos os registros de estoque >= 0', async () => {
            const [rows] = await pool.query(
                `SELECT id_estoque, qtd_atual
                 FROM estoque
                 WHERE qtd_atual < 0`
            );

            expect(rows.length).toBe(0);
        });

        test('todos os ajustes devem ter qtd_nova = qtd_anterior + diferenca', async () => {
            const [ajustes] = await pool.query(
                `SELECT
                    id_ajuste,
                    qtd_anterior,
                    diferenca,
                    qtd_nova
                 FROM ajustes`
            );

            for (const a of ajustes) {
                expect(Number(a.qtd_nova))
                    .toBe(
                        Number(a.qtd_anterior) +
                        Number(a.diferenca)
                    );
            }
        });

        test('todas as entradas referenciam lotes existentes', async () => {
            const [rows] = await pool.query(`
                SELECT e.id_entrada
                FROM entrada e
                LEFT JOIN lote l
                    ON e.id_lote = l.id_lote
                WHERE l.id_lote IS NULL
            `);

            expect(rows.length).toBe(0);
        });

        test('todas as saídas referenciam lotes existentes', async () => {
            const [rows] = await pool.query(`
                SELECT s.id_saida
                FROM saida s
                LEFT JOIN lote l
                    ON s.id_lote = l.id_lote
                WHERE l.id_lote IS NULL
            `);

            expect(rows.length).toBe(0);
        });
    });
});