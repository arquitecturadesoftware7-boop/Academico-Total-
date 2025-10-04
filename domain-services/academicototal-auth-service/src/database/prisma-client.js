// src/database/prisma-client.js
const { PrismaClient } = require('@prisma/client');

// [DOCUMENTACION] Se inicializa el cliente de Prisma. Usando el patrón Singleton 
// para asegurar que solo haya una instancia de conexión a la DB en toda la aplicación.
// Esto es crucial para la gestión eficiente de las conexiones a la DB.
const prisma = new PrismaClient();

module.exports = prisma;