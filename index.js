require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

// Comprobación básica del servidor.
app.get('/', (req, res) => {
    res.status(200).json({
        mensaje: 'API de Service-FoodMang funcionando.'
    });
});

// Rutas de la API.
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Ruta inexistente.
app.use((req, res) => {
    res.status(404).json({
        error: {
            status: 404,
            mensaje: 'Ruta no encontrada.'
        }
    });
});

// Manejo de errores no controlados por los controladores.
app.use((error, req, res, next) => {
    console.error('Error del servidor:', error);

    if (res.headersSent) {
        return next(error);
    }

    return res.status(500).json({
        error: {
            status: 500,
            mensaje: 'Error interno del servidor.'
        }
    });
});

async function iniciarServidor() {
    try {
        await sequelize.authenticate();

        console.log('Conexión a PostgreSQL establecida.');

        app.listen(PORT, () => {
            console.log(`Servidor disponible en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo iniciar el servidor:', error.message);
        process.exitCode = 1;
    }
}

iniciarServidor();