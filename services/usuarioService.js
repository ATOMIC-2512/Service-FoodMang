const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { Usuario, Rol } = require('../models');

const CAMPOS_PUBLICOS = [
    'id_usuario',
    'id_rol',
    'nombre',
    'username',
    'activo',
    'creado_en'
];

function errorServicio(mensaje, statusCode) {
    const error = new Error(mensaje);
    error.statusCode = statusCode;
    throw error;
}

function validarTexto(valor, campo, maximo) {
    if (typeof valor !== 'string' || !valor.trim()) {
        errorServicio(`${campo} es obligatorio y debe ser texto.`, 400);
    }

    if (valor.trim().length > maximo) {
        errorServicio(`${campo} no puede superar ${maximo} caracteres.`, 400);
    }

    return valor.trim();
}

function validarPassword(password) {
    if (typeof password !== 'string' || password.length < 8) {
        errorServicio(
            'La contraseña debe tener al menos 8 caracteres.',
            400
        );
    }

    return password;
}

async function validarRol(id_rol) {
    if (
        id_rol === undefined ||
        id_rol === null ||
        id_rol === '' ||
        !Number.isInteger(Number(id_rol)) ||
        Number(id_rol) < 1
    ) {
        errorServicio('id_rol debe ser un identificador válido.', 400);
    }

    const rol = await Rol.findByPk(Number(id_rol));

    if (!rol) {
        errorServicio('El rol indicado no existe.', 400);
    }

    return Number(id_rol);
}

function prepararUsuario(usuario) {
    const datos = usuario.toJSON();
    delete datos.password_hash;
    return datos;
}

async function crear(datos) {
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
        errorServicio('El cuerpo debe ser un objeto válido.', 400);
    }

    for (const campo of ['nombre', 'username', 'password', 'id_rol']) {
        if (
            datos[campo] === undefined ||
            datos[campo] === null
        ) {
            errorServicio(`El campo ${campo} es obligatorio.`, 400);
        }
    }

    const nombre = validarTexto(datos.nombre, 'nombre', 80);
    const username = validarTexto(datos.username, 'username', 40);
    const password = validarPassword(datos.password);
    const id_rol = await validarRol(datos.id_rol);

    const existente = await Usuario.findOne({
        where: { username }
    });

    if (existente) {
        errorServicio('El username ya está registrado.', 409);
    }

    const password_hash = await bcrypt.hash(password, 12);

    const usuario = await Usuario.create({
        nombre,
        username,
        password_hash,
        id_rol
    });

    return consultarPorId(usuario.id_usuario);
}

async function listar({ pagina = 1, limite = 10, id_rol } = {}) {
    pagina = Number(pagina);
    limite = Number(limite);

    if (!Number.isInteger(pagina) || pagina < 1) {
        errorServicio('pagina debe ser un entero mayor que cero.', 400);
    }

    if (!Number.isInteger(limite) || limite < 1 || limite > 100) {
        errorServicio('limite debe estar entre 1 y 100.', 400);
    }

    const where = {};

    if (id_rol !== undefined && id_rol !== '') {
        where.id_rol = await validarRol(id_rol);
    }

    const { count, rows } = await Usuario.findAndCountAll({
        attributes: CAMPOS_PUBLICOS,
        include: [{
            model: Rol,
            as: 'rol',
            attributes: ['id_rol', 'nombre']
        }],
        where,
        order: [['id_usuario', 'ASC']],
        limit: limite,
        offset: (pagina - 1) * limite
    });

    return {
        datos: rows.map(prepararUsuario),
        paginacion: {
            total: count,
            pagina,
            limite,
            totalPaginas: Math.ceil(count / limite)
        }
    };
}

async function consultarPorId(id) {
    const usuario = await Usuario.findByPk(id, {
        attributes: CAMPOS_PUBLICOS,
        include: [{
            model: Rol,
            as: 'rol',
            attributes: ['id_rol', 'nombre']
        }]
    });

    if (!usuario) {
        errorServicio('Usuario no encontrado.', 404);
    }

    return prepararUsuario(usuario);
}

async function actualizar(id, datos) {
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
        errorServicio('El cuerpo debe ser un objeto válido.', 400);
    }

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
        errorServicio('Usuario no encontrado.', 404);
    }

    const permitidos = ['nombre', 'username', 'password', 'id_rol'];
    const campos = Object.keys(datos);

    if (
        campos.length === 0 ||
        campos.some(campo => !permitidos.includes(campo))
    ) {
        errorServicio('Envía campos válidos para actualizar.', 400);
    }

    const cambios = {};

    if (datos.nombre !== undefined) {
        cambios.nombre = validarTexto(datos.nombre, 'nombre', 80);
    }

    if (datos.username !== undefined) {
        cambios.username = validarTexto(datos.username, 'username', 40);

        const existente = await Usuario.findOne({
            where: {
                username: cambios.username,
                id_usuario: { [Op.ne]: usuario.id_usuario }
            }
        });

        if (existente) {
            errorServicio('El username ya está registrado.', 409);
        }
    }

    if (datos.password !== undefined) {
        cambios.password_hash = await bcrypt.hash(
            validarPassword(datos.password),
            12
        );
    }

    if (datos.id_rol !== undefined) {
        cambios.id_rol = await validarRol(datos.id_rol);
    }

    await usuario.update(cambios);

    return consultarPorId(usuario.id_usuario);
}

async function darDeBaja(id) {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
        errorServicio('Usuario no encontrado.', 404);
    }

    if (!usuario.activo) {
        errorServicio('El usuario ya está dado de baja.', 400);
    }

    await usuario.update({ activo: false });

    return prepararUsuario(usuario);
}

module.exports = {
    crear,
    listar,
    consultarPorId,
    actualizar,
    darDeBaja
};
