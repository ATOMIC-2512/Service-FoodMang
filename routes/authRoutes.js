const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// Inicio de sesión público: no requiere token previo.
router.post('/login', authController.login);

module.exports = router;