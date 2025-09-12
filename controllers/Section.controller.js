const BusinessError = require("../error/BusinessError");
const TechnicalError = require('../error/TechnicalError');
const db = require('../models');
const Section = db.section;
const Category = db.category;
const Question = db.question;
//const { removeEmpty } = require('../utils/removeEmpty.js');

const SectionSerializer = require('../serializer/sectionserializer.js');

exports.getAllSections = async(req, res, next) =>{
    try {
        let whereCondition = {};
        const pageSize = parseInt(req.query["page"]?.["size"]) || 10;
        const pageNumber = parseInt(req.query["page"]?.["number"]) || 0;
        const offset = pageNumber * pageSize;

       if (req.query.filter) {
        Object.keys(req.query.filter).forEach((key) => {
            whereCondition[key] = req.query.filter[key];
        });
      }
      
      let attributes = req.query.fields ? req.query.fields.split(",") : undefined;

       let order = [];
        if (req.query.sort) {
            const sortFields = req.query.sort.split(",");
            sortFields.forEach((field) => {
                const sortOrder = field.startsWith("-") ? "DESC" : "ASC";
                const sortField = field.replace("-", "");
                order.push([sortField, sortOrder]);
            });
        } else {
            order.push(["created_at", "ASC"]); 
        }

      const [items, totalCount] = await Promise.all([
        Section.findAll({
          attributes,
          offset,
          limit: pageSize,
          where: whereCondition,
          order,
        }),
        Section.count({ where: whereCondition }),
      ]);
      const totalPages = Math.ceil(totalCount / pageSize);

      let serializedData = SectionSerializer.serialize(items);
      //serializedData = removeEmpty(serializedData);
      serializedData.meta = {
            page: {
                page_number: pageNumber,
                page_size: pageSize,
                total_count: totalCount,
                total_pages: totalPages
            }
        };

      res.status(200).json(serializedData);

    }catch (error) {
        next(error instanceof BusinessError ? error : new TechnicalError(500, "Internal Server Error", error.message));
    }
}

exports.getSectionById = async (req, res, next) => {
  try {
    const id = req.params.sectionId;
    
    let attributes = req.query.fields ? req.query.fields.split(",") : undefined;
    
    const section = await Section.findByPk(id, {
      attributes
    });
    
    if (!section) {
      const notFoundError = new BusinessError(404, "Not Found");
      notFoundError.addError("data", `Section with id ${id} not found`);
      throw notFoundError;
    }
    
    const serializedData = SectionSerializer.serialize(section);
    res.status(200).json(serializedData);
    
  } catch (error) {
    next(error instanceof BusinessError ? error : new TechnicalError(500, "Internal Server Error", error.message));
  }
}

exports.getSectionsByCategory = async(req, res, next) =>{
    try {
        const categoryId = req.params.categoryId;
        let whereCondition = { category_id: categoryId };
        const pageSize = parseInt(req.query["page"]?.["size"]) || config.limit;
        const pageNumber = parseInt(req.query["page"]?.["number"]) || 0;
        const offset = pageNumber * pageSize;

       if (req.query.filter) {
        Object.keys(req.query.filter).forEach((key) => {
            whereCondition[key] = req.query.filter[key];
        });
      }
      
      let attributes = req.query.fields ? req.query.fields.split(",") : undefined;

       let order = [];
        if (req.query.sort) {
            const sortFields = req.query.sort.split(",");
            sortFields.forEach((field) => {
                const sortOrder = field.startsWith("-") ? "DESC" : "ASC";
                const sortField = field.replace("-", "");
                order.push([sortField, sortOrder]);
            });
        } else {
            order.push(["created_at", "ASC"]); 
        }

      // Check if category exists
      const category = await Category.findByPk(categoryId);
      if (!category) {
        const notFoundError = new BusinessError(404, "Not Found");
        notFoundError.addError("data", `Category with id ${categoryId} not found`);
        throw notFoundError;
      }

      const [items, totalCount] = await Promise.all([
        Section.findAll({
          attributes,
          offset,
          limit: pageSize,
          where: whereCondition,
          order,
        }),
        Section.count({ where: whereCondition }),
      ]);
      const totalPages = Math.ceil(totalCount / pageSize);

      let serializedData = SectionSerializer.serialize(items);
      //serializedData = removeEmpty(serializedData);
      serializedData.meta = {
            page: {
                page_number: pageNumber,
                page_size: pageSize,
                total_count: totalCount,
                total_pages: totalPages
            }
        };

      res.status(200).json(serializedData);

    }catch (error) {
        next(error instanceof BusinessError ? error : new TechnicalError(500, "Internal Server Error", error.message));
    }
}

exports.createSection = async (req, res, next) => {
    try {
      const {title, description, category_id} = req.body;
      const categoryIdFromRoute = req.params.categoryId;

      const businessError = new BusinessError(400, "Bad Request");
      
      // Use category_id from route if available, otherwise from body
      const finalCategoryId = categoryIdFromRoute || category_id;
      
      // Check if category exists
      if (finalCategoryId) {
        const category = await Category.findByPk(finalCategoryId);
        if (!category) {
          businessError.addError("attributes.category_id", "Category does not exist");
        }
      }

      if (businessError.errors.length > 0) throw businessError;

      // Prepare data for creation
      const createData = {
        title,
        description,
        category_id: finalCategoryId
      };

      const section = await Section.create(createData);
      const serializedData = SectionSerializer.serialize(section);
      res.status(201).json(serializedData);

    } catch (error) {
        next(error instanceof BusinessError ? error : new TechnicalError(500, "Internal Server Error", error.message));
    }
  }

exports.updateSection = async (req, res, next) => {
  try {
    const id = req.params.sectionId;
    const update = await Section.findByPk(id);
    const businessError = new BusinessError(400, "Bad Request");
    
    if (!update) {
      const notFoundError = new BusinessError(404, "Not Found");
      notFoundError.addError("data", `Section with id ${id} not found`);
      throw notFoundError;
    }

    // Only update the fields that are provided in the request
    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;

    const updated = await update.update(updateData);
    const serializedData = SectionSerializer.serialize(updated);
    res.status(200).json(serializedData);

  } catch (error) {
    next(error instanceof BusinessError ? error : new TechnicalError(500, "Internal Server Error", error.message));
  }
}

exports.deleteSection = async (req, res, next) => {
  try {
    const id = req.params.sectionId;
    const section = await Section.findByPk(id);
    
    if (!section) {
      const notFoundError = new BusinessError(404, "Not Found");
      notFoundError.addError("data", `Section with id ${id} not found`);
      throw notFoundError;
    }

    // Check if section has questions
    const questionsCount = await Question.count({ where: { section_id: id } });
    if (questionsCount > 0) {
      const businessError = new BusinessError(400, "Bad Request");
      businessError.addError("data", "Cannot delete section that has questions. Please delete all questions first.");
      throw businessError;
    }

    await section.destroy();
    res.status(204).send(); 
  } catch (error) {
    next(error instanceof BusinessError ? error : new TechnicalError(500, "Internal Server Error", error.message));
  }
}
