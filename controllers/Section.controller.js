const db = require('../models');
const Section = db.section;
const Category = db.category;
const SectionSerializer = require('../serializer/sectionserializer.js');
const SectionInlineSerializer = require('../serializer/Section.inline.serializer.js');
const { createCrudOperations } = require('../utils/crudOperations.js');
const NotFoundError = require('../error/exception/NotFound.js');
const BusinessError = require('../error/BusinessError');
const { clearWeightCache } = require('../services/weightConfigService');

const allowedFields = [
  "id",
  "category_id",
  "title",
  "title_fr",
  "description",
  "core",
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

const getAllSections = async (req, res, next) => {
  try {
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

const getSectionById = async (req, res, next) => {
  try {
    req.params.id = req.params.sectionId;
    await crudOps.getById(req, res, next);
  } catch (error) {
    next(error);
  }
};

const getSectionsByCategory = async (req, res, next) => {
  try {
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

    const finalCategoryId = categoryIdFromRoute || req.body.category_id;
    if (finalCategoryId) {
      const category = await Category.findByPk(finalCategoryId);
      if (!category) {
        businessError.addError("attributes.category_id", "Category does not exist");
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    req.body.category_id = finalCategoryId;
    // Adding a section changes the per-sub-sector weight universe (uniform
    // fallback + shape of admin weight editor), so evict all caches.
    clearWeightCache();
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

    // Removing / changing core impacts scoring — evict weight cache.
    clearWeightCache();

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

    await section.destroy();
    clearWeightCache();
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
