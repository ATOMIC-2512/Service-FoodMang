const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../models');

async function login(username, password) {
    if (
        typeof username !== 'string' ||
        !username.trim() ||
        typeof password !== 'string' ||
        !password
    ) {
        const error = new Error('Username y contraseña son obligatorios.');
        error.statusCode = 400;
        throw error;
    }

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET no está configurado.');
    }

    const usuario = await Usuario.findOne({
        where: {
            username: username.trim()
        },
        include: [{
            model: Rol,
            as: 'rol',
            attributes: ['id_rol', 'nombre']
        }]
    });

    if (!usuario || !usuario.activo) {
        const error = new Error('Credenciales incorrectas o usuario inactivo.');
        error.statusCode = 401;
        throw error;
    }

    const passwordValida = await bcrypt.compare(
        password,
        usuario.password_hash
    );

    if (!passwordValida) {
        const error = new Error('Credenciales incorrectas o usuario inactivo.');
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign(
        {
            id_usuario: usuario.id_usuario,
            username: usuario.username,
            rol: usuario.rol.nombre
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '8h'
        }
    );

    return {
        token,
        usuario: {
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            username: usuario.username,
            rol: usuario.rol.nombre
        }
    };
}

module.exports = { login };