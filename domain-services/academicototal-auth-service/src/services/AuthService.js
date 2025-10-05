const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY || 'super_secreto_para_jwt';
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || 'super_secreto_para_refresh';

const ACCESS_TOKEN_EXPIRY = '15m'; 
const REFRESH_TOKEN_EXPIRY = '7d';

class AuthService {

    generateTokens(user) {
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

        return { accessToken, refreshToken }; 
    }

    async login(plainPassword, storedPasswordHash, userDetails) {
        
        const isPasswordValid = await bcrypt.compare(plainPassword, storedPasswordHash);

        if (!isPasswordValid) {
            throw new Error('Credenciales inválidas');
        }

        const { accessToken, refreshToken } = this.generateTokens(userDetails);

        return {
            accessToken,
            refreshToken,
            user: userDetails
        };
    }

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
    
    async refreshAccessToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
            
            const newAccessToken = jwt.sign({ 
                id: decoded.id, 
                role: decoded.role,
                email: decoded.email
            }, SECRET_KEY, {
                expiresIn: ACCESS_TOKEN_EXPIRY,
            });

            return newAccessToken;

        } catch (error) {
            throw error; 
        }
    }
}

module.exports = new AuthService();