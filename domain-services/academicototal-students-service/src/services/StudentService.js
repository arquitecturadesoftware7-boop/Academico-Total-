const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid'); // Necesario para generar IDs universales
const prisma = new PrismaClient();

// Constante para el costo del hashing de contraseñas
const SALT_ROUNDS = 10; 

class StudentService {
    
    // ----------------------------------------------------
    // Servicio: Registro y Creación de Perfil (Internal POST /profiles)
    // Se encarga del hashing de la contraseña y la creación de la identidad/perfil.
    // ----------------------------------------------------
    async createProfile({ email, password, role, enrollmentId, entryYear, major }) {
        // 1. Hashear la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS); 
        
        // 2. Generar el ID universal del usuario/estudiante
        const newUserId = uuidv4(); 
        
        try {
            const newProfile = await prisma.studentProfile.create({
                data: {
                    id: newUserId, 
                    email, 
                    password: hashedPassword, 
                    role,
                    enrollmentId,
                    entryYear,
                    major,
                    // Nota: Se asume que el campo 'name' no está en el esquema de Prisma para evitar el error anterior.
                },
                // Selecciona solo los campos que no son sensibles para la respuesta de creación.
                select: {
                    id: true,
                    email: true,
                    role: true,
                    enrollmentId: true,
                    entryYear: true,
                    major: true,
                    status: true,
                }
            });
            return newProfile;
            
        } catch (error) {
            if (error.code === 'P2002') { // Prisma error code for unique constraint violation
                throw new Error('El email o enrollmentId ya está registrado.');
            }
            // Propagar cualquier otro error
            throw error;
        }
    }

    // ----------------------------------------------------
    // Servicio: Login Interno (Internal POST /login)
    // Usado por el Aggregator para obtener el ID, ROL y HASH de la contraseña.
    // ----------------------------------------------------
    async getIdentityForLogin(email) {
        const user = await prisma.studentProfile.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true, // CLAVE: Devolvemos el hash para que el Auth Service lo compare
                role: true,
                enrollmentId: true,
                entryYear: true,
                major: true,
            }
        });

        if (!user) {
            // Error genérico para no revelar si el usuario existe o no
            throw new Error('Usuario no encontrado o credenciales inválidas');
        }

        // Renombramos 'password' (hash) a 'password' para que el Aggregator sepa qué enviar.
        const { password: storedPasswordHash, ...rest } = user;

        return {
            password: storedPasswordHash, // Hash que el Aggregator enviará al Auth Service
            ...rest
        };
    }

    // ----------------------------------------------------
    // Servicio: Obtener Perfil (Internal GET /profiles/:studentId)
    // ----------------------------------------------------
    async getProfileById(studentId) {
        const profile = await prisma.studentProfile.findUnique({
            where: { id: studentId },
            select: {
                id: true,
                enrollmentId: true,
                entryYear: true,
                major: true,
                status: true,
                email: true, // Incluimos el email para tenerlo en el perfil
            }
        });

        if (!profile) {
            throw new Error('Perfil de estudiante no encontrado.');
        }

        return profile;
    }
}

module.exports = new StudentService();