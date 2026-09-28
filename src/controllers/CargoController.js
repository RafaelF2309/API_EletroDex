const CargoService = require('../services/CargoService');

class CargoController {
    async listar(req, res) {
<<<<<<< HEAD
        try {
            const resultado = await CargoService.listarCargos();
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const resultado = await CargoService.buscarCargoPorId(req.params.id);
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }

    async criar(req, res) {
        try {
            const resultado = await CargoService.criarCargo(req.body);
            res.status(201).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }

    async atualizar(req, res) {
        try {
            const resultado = await CargoService.atualizarCargo(req.params.id, req.body);
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
    }

    async remover(req, res) {
        try {
            const resultado = await CargoService.removerCargo(req.params.id);
            res.status(200).json(resultado);
        } catch (erro) {
            res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || erro.message });
        }
=======
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
>>>>>>> 6336b4dfb45c281e5aea49faff9ab12de2caf7bb
    }
}

module.exports = new CargoController();
