const usuarioService = require('../services/usuarioService');

function manejarError(res, error) {
    const statusCode = error.statusCode || 500;

    if (statusCode === 500) {
        console.error('Error interno:', error);
    }

    return res.status(statusCode).json({
        error: {
            status: statusCode,
            mensaje: statusCode === 500
                ? 'Error interno del servidor.'
                : error.message
        }
    });
}

async function crear(req, res) {
    try {
        const usuario = await usuarioService.crear(req.body);

        return res.status(201).json({
            mensaje: 'Usuario creado correctamente.',
            datos: usuario
        });
    } catch (error) {
        return manejarError(res, error);
    }
}

async function listar(req, res) {
    try {
        const resultado = await usuarioService.listar({
            pagina: req.query.pagina,
            limite: req.query.limite,
            id_rol: req.query.id_rol
        });

        return res.status(200).json(resultado);
    } catch (error) {
        return manejarError(res, error);
    }
}

async function consultarPorId(req, res) {
    try {
        const usuario = await usuarioService.consultarPorId(
            req.params.id
        );

        return res.status(200).json({ datos: usuario });
    } catch (error) {
        return manejarError(res, error);
    }
}

async function actualizar(req, res) {
    try {
        const usuario = await usuarioService.actualizar(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            mensaje: 'Usuario actualizado correctamente.',
            datos: usuario
        });
    } catch (error) {
        return manejarError(res, error);
    }
}

async function darDeBaja(req, res) {
    try {
        const usuario = await usuarioService.darDeBaja(
            req.params.id
        );

        return res.status(200).json({
            mensaje: 'Usuario dado de baja correctamente.',
            datos: usuario
        });
    } catch (error) {
        return manejarError(res, error);
    }
}

module.exports = {
    crear,
    listar,
    consultarPorId,
    actualizar,
    darDeBaja
};