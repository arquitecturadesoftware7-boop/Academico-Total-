const express = require('express');
const AggregatorController = require('../controllers/AggregatorController');
const authMiddleware = require('../middlewares/authMiddleware'); 

const router = express.Router();

router.post('/register/student', AggregatorController.registerStudent); 
router.post('/login', AggregatorController.login);
router.post('/token/refresh', AggregatorController.refreshToken);

router.get('/profiles', authMiddleware, AggregatorController.getUserProfile); 

module.exports = router;