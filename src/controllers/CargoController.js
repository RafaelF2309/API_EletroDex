const CargoService = require('../services/CargoService');

class CargoController {
    async listar(req, res) {
        try { return res.status(200).json(await CargoService.listarCargos()); }
        catch (erro) { return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message }); }
    }
    async buscarPorId(req, res) {
        try { return res.status(200).json(await CargoService.buscarCargoPorId(req.params.id)); }
        catch (erro) { return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message }); }
    }
    async criar(req, res) {
        try { return res.status(201).json(await CargoService.criarCargo(req.body)); }
        catch (erro) { return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message }); }
    }
    async atualizar(req, res) {
        try { return res.status(200).json(await CargoService.atualizarCargo(req.params.id, req.body)); }
        catch (erro) { return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message }); }
    }
    async remover(req, res) {
        try { return res.status(200).json(await CargoService.removerCargo(req.params.id)); }
        catch (erro) { return res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message }); }
    }
}

module.exports = new CargoController();
