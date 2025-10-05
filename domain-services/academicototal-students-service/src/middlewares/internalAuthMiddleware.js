// src/middlewares/internalAuthMiddleware.js

require('dotenv').config();

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

const internalAuthMiddleware = (req, res, next) => {
    // 1. Obtener el secreto del header 'X-Internal-Secret'
    const secret = req.header('X-Internal-Secret');

    if (!secret) {
        // Rechazo si no se proporciona el secreto
        console.warn('Acceso denegado a Student Service: Falta X-Internal-Secret.');
        return res.status(403).json({ 
            message: 'Acceso prohibido. Requiere clave secreta interna.' 
        });
    }

    if (secret !== INTERNAL_API_SECRET) {
        // Rechazo si el secreto es inválido
        console.warn('Acceso denegado a Student Service: Clave secreta inválida.');
        return res.status(403).json({ 
            message: 'Acceso prohibido. Clave secreta inválida.' 
        });
    }

    // 3. Si el secreto es válido, permite el acceso al controlador.
    next();
};

module.exports = internalAuthMiddleware;