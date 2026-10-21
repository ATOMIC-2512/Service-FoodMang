const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: {
                status: 401,
                mensaje: 'Se requiere un token de autenticación.'
            }
        });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: {
                status: 401,
                mensaje: 'El token no fue proporcionado.'
            }
        });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({
            error: {
                status: 401,
                mensaje: 'Token inválido o expirado.'
            }
        });
    }
}

module.exports = authMiddleware;