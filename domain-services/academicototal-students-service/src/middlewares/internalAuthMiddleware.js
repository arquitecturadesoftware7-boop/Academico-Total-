require('dotenv').config();

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

const internalAuthMiddleware = (req, res, next) => {
    // Obtener el secreto del header 'X-Internal-Secret'
    const secret = req.header('X-Internal-Secret');

    if (!secret) {
        console.warn('Acceso denegado a Student Service: Falta X-Internal-Secret.');
        return res.status(403).json({ 
            message: 'Acceso prohibido. Requiere clave secreta interna.' 
        });
    }

    if (secret !== INTERNAL_API_SECRET) {
        console.warn('Acceso denegado a Student Service: Clave secreta inválida.');
        return res.status(403).json({ 
            message: 'Acceso prohibido. Clave secreta inválida.' 
        });
    }

    next();
};

module.exports = internalAuthMiddleware;