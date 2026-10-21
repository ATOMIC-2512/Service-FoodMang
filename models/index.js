const sequelize = require('../config/database');
const Rol = require('./rol.Model');
const Usuario = require('./usuario.Model');

// Un rol puede estar asignado a muchos usuarios.
Rol.hasMany(Usuario, {
    foreignKey: 'id_rol',
    as: 'usuarios'
});

// Cada usuario pertenece a un rol.
Usuario.belongsTo(Rol, {
    foreignKey: 'id_rol',
    as: 'rol'
});

module.exports = {
    sequelize,
    Rol,
    Usuario
};