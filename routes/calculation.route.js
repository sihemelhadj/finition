const express = require('express');
const router = express.Router();
const calculController = require('../controller/calculation.controller');

// POST /v1/calcul
router.post('/', calculController.calculate);

module.exports = router;