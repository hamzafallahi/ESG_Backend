const db = require('../models');
const Section = db.section;
const Category = db.category;
const Question = db.question;
const SectionSerializer = require('../serializer/sectionserializer.js');
const SectionInlineSerializer = require('../serializer/Section.inline.serializer.js');
const { createCrudOperations } = require('../utils/crudOperations.js');
const NotFoundError = require('../error/exception/NotFound.js');
const BusinessError = require("../error/BusinessError");

const allowedFields = [
  "id",
  "category_id",
  "title",
  "title_fr",
  "description",
  "core",
  "code",
  "domain_id",
  "created_at",
  "updated_at",
  "deleted_at",
];

const crudOps = createCrudOperations({
  Model: Section,
  modelName: "Section",
  Serializer: SectionSerializer,
  InlineSerializer: SectionInlineSerializer,
  allowedIncludes: ["category", "questions", "questions.rscis", "result_sections"],
  allowedFields,
  defaultIncludes: ["category", "questions"],
});

// CRUD operations for sections by category (with parent relationship)
const crudOpsByCategory = createCrudOperations({
  Model: Section,
  modelName: "Section",
  Serializer: SectionSerializer,
  InlineSerializer: SectionInlineSerializer,
  allowedIncludes: ["category", "questions", "questions.rscis"],
  allowedFields,
  defaultIncludes: [],
  parentIdField: "category_id",
});

// Custom getAll with pagination
const getAllSections = async (req, res, next) => {
  try {
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

const getSectionById = async (req, res, next) => {
  try {
    // Map sectionId param to id for crudOps
    req.params.id = req.params.sectionId;
    await crudOps.getById(req, res, next);
  } catch (error) {
    next(error);
  }
};

const getSectionsByCategory = async (req, res, next) => {
  try {
    // Map categoryId param to category_id for crudOps
    req.params.category_id = req.params.categoryId;
    await crudOpsByCategory.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

const createSection = async (req, res, next) => {
  try {
    const categoryIdFromRoute = req.params.categoryId;
    const businessError = new BusinessError(400, "Bad Request");
    
    // Use category_id from route if available, otherwise from body
    const finalCategoryId = categoryIdFromRoute || req.body.category_id;
    
    // Check if category exists
    if (finalCategoryId) {
      const category = await Category.findByPk(finalCategoryId);
      if (!category) {
        businessError.addError("attributes.category_id", "Category does not exist");
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    // Add category_id to request body for creation
    req.body.category_id = finalCategoryId;

    await crudOps.create(req, res, next);
  } catch (error) {
    next(error);
  }
};

const updateSection = async (req, res, next) => {
  try {
    const id = req.params.sectionId;
    const section = await Section.findByPk(id);
    
    if (!section) {
      throw new NotFoundError("Section not found", "Section");
    }

    // Map sectionId param to id for crudOps
    req.params.id = req.params.sectionId;
    await crudOps.update(req, res, next);
  } catch (error) {
    next(error);
  }
};

const deleteSection = async (req, res, next) => {
  try {
    const id = req.params.sectionId;
    const section = await Section.findByPk(id);
    
    if (!section) {
      throw new NotFoundError("Section not found", "Section");
    }

    // Check if section has questions
   /* const questionsCount = await Question.count({ where: { section_id: id } });
    if (questionsCount > 0) {
      const businessError = new BusinessError(400, "Bad Request");
      businessError.addError("data", "Cannot delete section that has questions. Please delete all questions first.");
      throw businessError;
    }*/

    await section.destroy();
    res.status(204).send(); 
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSections,
  getSectionById,
  getSectionsByCategory,
  createSection,
  updateSection,
  deleteSection,
};
