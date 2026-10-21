const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define(
    'Usuario',
    {
        id_usuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_rol: {
            type: DataTypes.SMALLINT,
            allowNull: false
        },
        nombre: {
            type: DataTypes.STRING(80),
            allowNull: false
        },
        username: {
            type: DataTypes.STRING(40),
            allowNull: false,
            unique: true
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        creado_en: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tableName: 'usuario',
        timestamps: false
    }
);

module.exports = Usuario;