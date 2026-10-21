require('dotenv').config();

const bcrypt = require('bcryptjs');
const { sequelize, Usuario, Rol } = require('../models');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

async function crearAdmin() {
    const rl = readline.createInterface({ input: stdin, output: stdout });

    try {
        await sequelize.authenticate();

        const rolAdmin = await Rol.findOne({
            where: { nombre: 'administrador' }
        });

        if (!rolAdmin) {
            throw new Error('No existe el rol administrador en la base de datos.');
        }

        const adminExistente = await Usuario.findOne({
            where: { id_rol: rolAdmin.id_rol }
        });

        if (adminExistente) {
            console.log(
                'Ya existe un usuario con rol administrador. No se creó otra cuenta.'
            );
            return;
        }

        const nombre = (await rl.question('Nombre del administrador: ')).trim();
        const username = (await rl.question('Username del administrador: ')).trim();
        const password = await rl.question('Contraseña inicial (mínimo 8 caracteres): ');

        if (!nombre || nombre.length > 80) {
            throw new Error('El nombre es obligatorio y admite hasta 80 caracteres.');
        }

        if (!username || username.length > 40) {
            throw new Error('El username es obligatorio y admite hasta 40 caracteres.');
        }

        if (password.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres.');
        }

        const usernameExistente = await Usuario.findOne({
            where: { username }
        });

        if (usernameExistente) {
            throw new Error('Ese username ya está registrado. Elige otro.');
        }

        const password_hash = await bcrypt.hash(password, 12);

        const admin = await Usuario.create({
            id_rol: rolAdmin.id_rol,
            nombre,
            username,
            password_hash,
            activo: true
        });

        console.log('Administrador inicial creado correctamente.');
        console.log(`ID: ${admin.id_usuario}`);
        console.log(`Username: ${admin.username}`);
        console.log('La contraseña no se muestra ni se guarda en el código.');
    } catch (error) {
        console.error('No se pudo crear el administrador:', error.message);
        process.exitCode = 1;
    } finally {
        rl.close();
        await sequelize.close();
    }
}

crearAdmin();