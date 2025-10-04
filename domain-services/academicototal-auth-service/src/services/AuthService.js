// src/services/AuthService.js

const prisma = require('../database/prisma-client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// [DOCUMENTACION] Constantes de seguridad y configuracion
const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m'; // 15 minutos (para proteccion)
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d'; // 7 dias (para conveniencia)
const SALT_ROUNDS = 10;

class AuthService {

    // ----------------------------------------------------
    // [UTILIDAD SEGURIDAD] Genera el par de tokens (Access y Refresh)
    // ----------------------------------------------------
    generateTokens(user) {
        // Los claims (id, role, email) son los datos de AUTORIZACIÓN que lleva el token.
        const claims = { id: user.id, role: user.role, email: user.email };

        // 1. Access Token (Corto): Usado para acceder a los recursos del Aggregator.
        const accessToken = jwt.sign(
            claims, 
            JWT_SECRET, 
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );

        // 2. Refresh Token (Largo): Usado solo para solicitar un nuevo Access Token.
        const refreshToken = jwt.sign(
            claims, 
            JWT_SECRET, // Se usa la misma clave secreta, pero con expiracion mas larga
            { expiresIn: REFRESH_TOKEN_EXPIRY }
        );

        return { accessToken, refreshToken };
    }

    // ----------------------------------------------------
    // [SEGURIDAD] Valida la integridad y expiracion de cualquier token
    // ----------------------------------------------------
    verifyTokenIntegrity(token) {
        // jwt.verify() lanza un error si el token esta expirado (TokenExpiredError) o la firma es invalida (JsonWebTokenError).
        return jwt.verify(token, JWT_SECRET);
    }
    
    // ----------------------------------------------------
    // Servicio: Registro de un nuevo usuario
    // ----------------------------------------------------
    async registerUser(name, email, password, role = 'STUDENT') {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        try {
            const user = await prisma.user.create({
                data: { name, email, password: hashedPassword, role },
                select: { id: true, email: true, name: true, role: true }
            });
            return user;
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error('El correo electrónico ya está registrado.');
            }
            throw error;
        }
    }

    // ----------------------------------------------------
    // Servicio: Login y Generación del PAR de JWTs
    // ----------------------------------------------------
    async login(email, password) {
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            throw new Error('Credenciales inválidas'); 
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new Error('Credenciales inválidas');
        }

        // [CLAVE SEGURIDAD] Generamos el par de tokens
        const { accessToken, refreshToken } = this.generateTokens(user);

        return {
            accessToken,
            refreshToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        };
    }

    // ----------------------------------------------------
    // Servicio: Renovar el Access Token usando el Refresh Token
    // ----------------------------------------------------
    async refreshAccessToken(refreshToken) {
        // 1. Verificar la integridad y validez del Refresh Token
        // Si el token es invalido o expira, verifyTokenIntegrity lanza un error.
        const decoded = this.verifyTokenIntegrity(refreshToken); 

        // 2. Obtener los claims (datos de autorizacion) del token validado
        const claims = { id: decoded.id, role: decoded.role, email: decoded.email };

        // 3. Generar un nuevo Access Token (solo el access token)
        const newAccessToken = jwt.sign(claims, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

        return newAccessToken;
    }
}

module.exports = new AuthService();