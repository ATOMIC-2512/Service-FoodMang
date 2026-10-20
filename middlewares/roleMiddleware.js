function roleMiddleware(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.user || !req.user.rol) {
            return res.status(403).json({
                error: {
                    status: 403,
                    mensaje: 'No tienes permisos para acceder a este recurso.'
                }
            });
        }

        const rolUsuario = String(req.user.rol).toLowerCase();

        const autorizado = rolesPermitidos.some(
            rol => rolUsuario === String(rol).toLowerCase()
        );

        if (!autorizado) {
            return res.status(403).json({
                error: {
                    status: 403,
                    mensaje: 'No tienes permisos para realizar esta operación.'
                }
            });
        }

        next();
    };
}

module.exports = roleMiddleware;