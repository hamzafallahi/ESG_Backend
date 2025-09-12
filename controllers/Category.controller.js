const db = require('../models');
const Category = db.category;
const Section = db.section;
const CategorySerializer = require('../serializer/categoryserializer.js');
const CategoryInlineSerializer = require('../serializer/Category.inline.serializer.js');
const { createCrudOperations } = require('../utils/crudOperations.js');
const NotFoundError = require('../error/exception/NotFound.js');
const BusinessError = require("../error/BusinessError");

const allowedFields = [
  "id",
  "name",
  "name_fr",
  "description",
  "created_at",
  "updated_at",
  "deleted_at",
];

const crudOps = createCrudOperations({
  Model: Category,
  modelName: "Category",
  Serializer: CategorySerializer,
  InlineSerializer: CategoryInlineSerializer,
  allowedIncludes: ["sections", "result_categories"],
  allowedFields,
  defaultIncludes: ["sections"],
});

// Custom getAll with pagination
const getAllCategories = async (req, res, next) => {
  try {
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    // Map categoryId param to id for crudOps
    req.params.id = req.params.categoryId;
    await crudOps.getById(req, res, next);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const businessError = new BusinessError(400, "Bad Request");
    
    // Check for name uniqueness
    if (name) {
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        businessError.addError("attributes.name", "Name already exists. Name must be unique");
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    const newCategory = await Category.create(req.body);
    let serializedData = CategorySerializer.serialize(newCategory);
    res.status(201).json(serializedData);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const id = req.params.categoryId;
    const update = await Category.findByPk(id);
    const businessError = new BusinessError(400, "Bad Request");
    
    if (!update) {
      throw new NotFoundError("Category not found", "Category");
    }
    
    // Check name uniqueness if name is being updated
    if (req.body.name && req.body.name !== update.name) {
      const existingCategory = await Category.findOne({ where: { name: req.body.name } });
      if (existingCategory) {
        businessError.addError("attributes.name", "Name already exists. Name must be unique");
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    await update.update(req.body);
    let serializedData = CategorySerializer.serialize(update);
    res.json(serializedData);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const id = req.params.categoryId;
    const category = await Category.findByPk(id);
    
    if (!category) {
      throw new NotFoundError("Category not found", "Category");
    }

    // Check if category has sections
    const sectionsCount = await Section.count({ where: { category_id: id } });
    if (sectionsCount > 0) {
      const businessError = new BusinessError(400, "Bad Request");
      businessError.addError("data", "Cannot delete category that has sections. Please delete all sections first.");
      throw businessError;
    }

    await category.destroy();
    res.status(204).send(); 
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
