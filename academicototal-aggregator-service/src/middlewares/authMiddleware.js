// src/middlewares/authMiddleware.js

const axios = require('axios');
// URL del Servicio de Autenticación (Token Mint)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL; 

/**
 * Middleware para validar el Access Token del cliente.
 * Llama al Auth Service para verificar la firma y expiración.
 */
const authMiddleware = async (req, res, next) => {
    // 1. Obtener el token del encabezado Authorization
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso denegado. Token Bearer no proporcionado o formato inválido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. [CLAVE SOA] Llamar al Auth Service para verificar la integridad del token
        const verificationResponse = await axios.post(`${AUTH_SERVICE_URL}/token/verify`, {
            token 
        });

        // 3. Extraer los claims del token válido (id, role, email)
        const { id, role, email } = verificationResponse.data.decoded; 
        
        // 4. Adjuntar los claims al objeto de la solicitud para su uso posterior en la orquestación
        req.user = { id, role, email };
        
        // 5. Continuar con la ejecución (hacia el AggregatorController)
        next();
        
    } catch (error) {
        // Manejo de errores de token (expirado, inválido, etc.)
        const status = error.response ? error.response.status : 401;
        
        // El mensaje de error viene del Auth Service (ej: "Token expirado")
        const message = error.response 
            ? error.response.data.message 
            : 'Error interno de verificación de token.';

        console.error(`Token inválido. Status: ${status}`);
        return res.status(status).json({ message: 'Error de autorización: ' + message });
    }
};

module.exports = authMiddleware;