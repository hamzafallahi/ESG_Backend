const db = require('../models');
const Section = db.section;
const Category = db.category;
const Question = db.question;
const Domain = db.domain;
const SectionSerializer = require('../serializer/sectionserializer.js');
const SectionInlineSerializer = require('../serializer/Section.inline.serializer.js');
const { createCrudOperations } = require('../utils/crudOperations.js');
const NotFoundError = require('../error/exception/NotFound.js');
const BusinessError = require("../error/BusinessError");
const { Op } = require('sequelize');
const { SECTION_TITLE_TO_CODE } = require('../config/esgScoring');

const allowedFields = [
  "id",
  "category_id",
  "title",
  "title_fr",
  "description",
  "core",
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

const CATEGORY_PREFIXES = {
  Environment: 'E',
  Environnement: 'E',
  Social: 'S',
  Governance: 'G',
  Gouvernance: 'G',
};

const PREFIX_TO_PILLAR = {
  E: 'Environment',
  S: 'Social',
  G: 'Governance',
};

const createNextDomainForCategory = async ({ prefix, title }) => {
  const candidateDomains = await Domain.findAll({
    where: { code: { [Op.like]: `${prefix}%` } },
    attributes: ['id', 'code'],
    order: [['code', 'ASC']],
  });

  const highestNumber = candidateDomains.reduce((maxValue, domain) => {
    const match = String(domain.code || '').match(new RegExp(`^${prefix}(\\d+)$`));
    const currentValue = match ? parseInt(match[1], 10) : 0;
    return Math.max(maxValue, currentValue);
  }, 0);

  return Domain.create({
    code: `${prefix}${highestNumber + 1}`,
    pillar: PREFIX_TO_PILLAR[prefix],
    label: title?.trim() || null,
  });
};

const resolveAutomaticDomain = async ({
  title,
  categoryId,
  explicitDomainId,
  fallbackDomainId,
  excludeSectionId,
}) => {
  if (explicitDomainId) {
    return Domain.findByPk(explicitDomainId, { attributes: ['id', 'code'] });
  }

  if (fallbackDomainId) {
    return Domain.findByPk(fallbackDomainId, { attributes: ['id', 'code'] });
  }

  const normalizedTitle = title?.trim();
  const mappedCode = normalizedTitle ? SECTION_TITLE_TO_CODE[normalizedTitle] : null;
  if (mappedCode) {
    const mappedDomain = await Domain.findOne({
      where: { code: mappedCode },
      attributes: ['id', 'code'],
    });
    if (mappedDomain) {
      return mappedDomain;
    }
  }

  if (!categoryId) {
    return null;
  }

  const category = await Category.findByPk(categoryId, {
    attributes: ['id', 'name', 'name_fr'],
  });
  if (!category) {
    return null;
  }

  const prefix = CATEGORY_PREFIXES[category.name] || CATEGORY_PREFIXES[category.name_fr];
  if (!prefix) {
    return null;
  }

  return createNextDomainForCategory({ prefix, title: normalizedTitle });
};

const applyResolvedDomain = async ({
  title,
  categoryId,
  explicitDomainId,
  fallbackDomainId,
  excludeSectionId,
}) => {
  const resolvedDomain = await resolveAutomaticDomain({
    title,
    categoryId,
    explicitDomainId,
    fallbackDomainId,
    excludeSectionId,
  });
  return resolvedDomain;
};

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

    const resolvedDomain = await applyResolvedDomain({
      title: req.body.title,
      categoryId: finalCategoryId,
      explicitDomainId: req.body.domain_id,
      fallbackDomainId: null,
      excludeSectionId: null,
    });

    if (businessError.errors.length > 0) throw businessError;

    // Add category_id to request body for creation
    req.body.category_id = finalCategoryId;
    req.body.domain_id = resolvedDomain?.id || null;

    await crudOps.create(req, res, next);
  } catch (error) {
    next(error);
  }
};

const updateSection = async (req, res, next) => {
  try {
    const id = req.params.sectionId;
    const section = await Section.findByPk(id);
    const businessError = new BusinessError(400, "Bad Request");
    
    if (!section) {
      throw new NotFoundError("Section not found", "Section");
    }

    const finalCategoryId = req.body.category_id || section.category_id;
    const resolvedDomain = await applyResolvedDomain({
      title: req.body.title || section.title,
      categoryId: finalCategoryId,
      explicitDomainId: req.body.domain_id,
      fallbackDomainId: section.domain_id,
      excludeSectionId: section.id,
    });

    if (businessError.errors.length > 0) throw businessError;

    req.body.domain_id = resolvedDomain?.id || null;

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
