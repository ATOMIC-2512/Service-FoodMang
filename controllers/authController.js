const authService = require('../services/authService');

async function login(req, res) {
    try {
        const { username, password } = req.body || {};

        const resultado = await authService.login(username, password);

        return res.status(200).json({
            mensaje: 'Inicio de sesión exitoso.',
            datos: resultado
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;

        if (statusCode === 500) {
            console.error('Error en el inicio de sesión:', error);
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
}

module.exports = { login };