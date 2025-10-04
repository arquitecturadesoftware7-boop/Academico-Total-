// src/services/AuthService.js

const prisma = require('../database/prisma-client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// [DOCUMENTACION] Se accede a la clave secreta desde las variables de entorno (.env).
// Esta clave es vital para firmar y verificar la autenticidad del JWT.
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10; // Factor de complejidad recomendado para bcrypt

class AuthService {
    
    // ----------------------------------------------------
    // Servicio: Registro de un nuevo usuario
    // ----------------------------------------------------
    async registerUser(name, email, password, role = 'STUDENT') {
        // 1. [SEGURIDAD] Hashing de la contraseña. Nunca se almacena en texto plano.
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // 2. Creación del usuario en la DB a través de Prisma.
        try {
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role
                },
                // [SEGURIDAD] Solo se devuelve información no sensible. El hash de la contraseña se omite.
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                }
            });
            return user;
        } catch (error) {
            // Manejo de error si el email ya existe (código de error de unicidad de Prisma)
            if (error.code === 'P2002') {
                throw new Error('El correo electrónico ya está registrado.');
            }
            throw error;
        }
    }

    // ----------------------------------------------------
    // Servicio: Login y Generación del JWT
    // Este método genera el token que el Data Aggregator usará para la autorización.
    // ----------------------------------------------------
    async login(email, password) {
        // 1. Buscar usuario en la base de datos por email
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            // [SEGURIDAD] Error genérico para no revelar si el email es incorrecto
            throw new Error('Credenciales inválidas'); 
        }

        // 2. [SEGURIDAD] Comparar la contraseña ingresada con el hash almacenado
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new Error('Credenciales inválidas');
        }

        // 3. Generar el JWT
        // [CLAVE SOA/DATA AGGREGATOR] El token contiene 'claims' (id, role, email). 
        // Estos claims son la base de la Autorización, permitiendo al Aggregator tomar decisiones
        // de acceso sin volver a consultar este servicio.
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email }, 
            JWT_SECRET, 
            { expiresIn: '1h' } // Duración del token
        );

        // Devolvemos el token y los datos clave del usuario.
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };
    }
}

module.exports = new AuthService();