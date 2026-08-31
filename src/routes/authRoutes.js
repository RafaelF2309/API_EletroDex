const express = require('express');
<<<<<<< HEAD
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;
=======

const router = express.Router();

const authController = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', (req, res) =>
    authController.login(req, res)
);

module.exports = router;
>>>>>>> 576f3cf141e17024050a6cdf09b3c6a0b46b1f53
