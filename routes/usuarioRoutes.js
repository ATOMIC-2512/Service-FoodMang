const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Todas las rutas requieren autenticación y rol de administrador.
router.use(authMiddleware);
router.use(roleMiddleware('administrador'));

router.post('/', usuarioController.crear);
router.get('/', usuarioController.listar);
router.get('/:id', usuarioController.consultarPorId);
router.put('/:id', usuarioController.actualizar);
router.delete('/:id', usuarioController.darDeBaja);

module.exports = router;