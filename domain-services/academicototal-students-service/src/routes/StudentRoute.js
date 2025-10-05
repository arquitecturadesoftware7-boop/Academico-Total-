// src/routes/studentRoutes.js

const express = require('express');
const StudentController = require('../controllers/StudentController');
const internalAuthMiddleware = require('../middlewares/internalAuthMiddleware'); 

const router = express.Router();

router.use(internalAuthMiddleware); 

router.post('/profiles', StudentController.createProfile);
router.get('/profiles/:studentId', StudentController.getProfile);
router.post('/login', StudentController.login);

module.exports = router;