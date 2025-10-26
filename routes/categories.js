const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/Category.controller');
const sectionController = require('../controllers/Section.controller');
const { create, update, getAll }  = require('../validation/Categories.rules.js');
const { create: createSection, getAll: getAllSections }  = require('../validation/Sections.rules.js');
const CategoryDeserializer = require('../deserializer/categorydeserializer.js');
const SectionDeserializer = require('../deserializer/sectiondeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');
const { requireAdmin } = require('../middleware/authMiddleware');

// Public reads (authentication already handled in index.js)
router.get('/', validate(getAll), categoryController.getAllCategories);

router.get('/:categoryId', categoryController.getCategoryById);

// Protected routes - only admins and super admins can create/update/delete
router.post('/', requireAdmin, validate(create), deserializeMiddleware(CategoryDeserializer), categoryController.createCategory);

router.patch('/:categoryId', requireAdmin, validate(update), deserializeMiddleware(CategoryDeserializer), categoryController.updateCategory);

router.delete('/:categoryId', requireAdmin, categoryController.deleteCategory);

// Nested routes for sections under categories
router.get('/:categoryId/sections', validate(getAllSections), sectionController.getSectionsByCategory);

router.post('/:categoryId/sections', requireAdmin, validate(createSection), deserializeMiddleware(SectionDeserializer), sectionController.createSection);

module.exports = router;
