const axios = require('axios');
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL; 

const authMiddleware = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso denegado. Token Bearer no proporcionado o formato inválido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const verificationResponse = await axios.post(`${AUTH_SERVICE_URL}/token/verify`, {
            token 
        });

        const { id, role, email } = verificationResponse.data.decoded; 
        
        req.user = { id, role, email };
        
        next();
        
    } catch (error) {
        const status = error.response ? error.response.status : 401;
        
        const message = error.response 
            ? error.response.data.message 
            : 'Error interno de verificación de token.';

        console.error(`Token inválido. Status: ${status}`);
        return res.status(status).json({ message: 'Error de autorización: ' + message });
    }
};

module.exports = authMiddleware;