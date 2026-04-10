const express = require('express');
const router = express.Router();
const categorieController = require('../controller/categorie.controller');

// GET /v1/categories
router.get('/', categorieController.getRootCategories);

// GET /v1/categories/:id
router.get('/:id', categorieController.getCategoryById);

// GET /v1/categories/:id/children
router.get('/:id/children', categorieController.getCategoryChildren);

module.exports = router;