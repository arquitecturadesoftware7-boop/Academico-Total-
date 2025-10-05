// src/services/AuthService.js (COMPLETO Y CORREGIDO)

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY || 'super_secreto_para_jwt';
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || 'super_secreto_para_refresh';

// Duración de los tokens (ajustable)
const ACCESS_TOKEN_EXPIRY = '15m'; 
const REFRESH_TOKEN_EXPIRY = '7d';

class AuthService {

    // ----------------------------------------------------
    // Servicio: Generación de Tokens (Faltante)
    // ----------------------------------------------------
    generateTokens(user) {
        // Los claims del JWT incluyen el ID, rol y email, obtenidos del Aggregator
        const claims = { 
            id: user.id, 
            role: user.role, 
            email: user.email 
        };

        const accessToken = jwt.sign(claims, SECRET_KEY, {
            expiresIn: ACCESS_TOKEN_EXPIRY,
        });

        const refreshToken = jwt.sign(claims, REFRESH_SECRET_KEY, {
            expiresIn: REFRESH_TOKEN_EXPIRY,
        });

        // [CLAVE] Retorna el objeto que espera ser desestructurado en login()
        return { accessToken, refreshToken }; 
    }

    // ----------------------------------------------------
    // Servicio: Login (Token Mint Pura)
    // ----------------------------------------------------
    async login(plainPassword, storedPasswordHash, userDetails) {
        
        // 1. Compara el password plano con el hash externo
        const isPasswordValid = await bcrypt.compare(plainPassword, storedPasswordHash);

        if (!isPasswordValid) {
            throw new Error('Credenciales inválidas');
        }

        // 2. Si es válido, genera los tokens
        const { accessToken, refreshToken } = this.generateTokens(userDetails);

        return {
            accessToken,
            refreshToken,
            user: userDetails
        };
    }

    // ----------------------------------------------------
    // Servicio: Verificación de Integridad de Token
    // ----------------------------------------------------
    verifyTokenIntegrity(token) {
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            return decoded;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expirado');
            }
            throw new Error('Token inválido o corrupto');
        }
    }
    
    // ----------------------------------------------------
    // Servicio: Renovación de Tokens
    // ----------------------------------------------------
    async refreshAccessToken(refreshToken) {
        try {
            // Verifica el refresh token usando la clave de refresh
            const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
            
            // Crea un nuevo access token con los mismos claims
            const newAccessToken = jwt.sign({ 
                id: decoded.id, 
                role: decoded.role,
                email: decoded.email
            }, SECRET_KEY, {
                expiresIn: ACCESS_TOKEN_EXPIRY,
            });

            return newAccessToken;

        } catch (error) {
            // Relanza el error para que el controlador lo maneje como 401
            throw error; 
        }
    }
}

module.exports = new AuthService();