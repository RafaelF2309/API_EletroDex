const request = require('supertest');
const app = require('../../src/app');

describe('Integração - Rota raiz da API', () => {
    test('deve confirmar que a API está funcionando em /api', async () => {
        const resposta = await request(app)
            .get('/api');

        expect(resposta.status).toBe(200);
        expect(resposta.body).toEqual({
            sucesso: true,
            mensagem: 'API EletroDex rodando com sucesso'
        });
    });
});
