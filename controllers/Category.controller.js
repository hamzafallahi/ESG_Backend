const BusinessError = require("../error/BusinessError");
const TechnicalError = require('../error/TechnicalError');
const db = require('../models');
const Category = db.category;
const Section = db.section;
//const { removeEmpty } = require('../utils/removeEmpty.js');

const CategorySerializer = require('../serializer/categoryserializer.js');

exports.getAllCategories = async(req, res, next) =>{
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
        Category.findAll({
          attributes,
          offset,
          limit: pageSize,
          where: whereCondition,
          order,
        }),
        Category.count({ where: whereCondition }),
      ]);
      const totalPages = Math.ceil(totalCount / pageSize);

      let serializedData = CategorySerializer.serialize(items);
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
exports.getCategoryById = async (req, res, next) => {
  try {
    const id = req.params.categoryId;
    
    let attributes = req.query.fields ? req.query.fields.split(",") : undefined;
    
    const category = await Category.findByPk(id, {
      attributes
    });
    
    if (!category) {
      const notFoundError = new BusinessError(404, "Not Found");
      notFoundError.addError("data", `Category with id ${id} not found`);
      throw notFoundError;
    }
    
    const serializedData = CategorySerializer.serialize(category);
    res.status(200).json(serializedData);
    
  } catch (error) {
    next(error instanceof BusinessError ? error : new TechnicalError(500, "Internal Server Error", error.message));
  }
}

exports.createCategory = async (req, res, next) => {
    try {
      const {name, description} = req.body;

      const businessError = new BusinessError(400, "Bad Request");
      
      // Check for name uniqueness
      if (name) {
        const existingCategory = await Category.findOne({ where: { name } });
        if (existingCategory) {
          businessError.addError("attributes.name", "Name already exists. Name must be unique");
        }
      }

      if (businessError.errors.length > 0) throw businessError;

      // Prepare data for creation
      const createData = {
        name,
        description
      };

      const category = await Category.create(createData);
      const serializedData = CategorySerializer.serialize(category);
      res.status(201).json(serializedData);

    } catch (error) {
        next(error instanceof BusinessError ? error : new TechnicalError(500, "Internal Server Error", error.message));
    }
  }

exports.updateCategory = async (req, res, next) => {
  try {
    const id = req.params.categoryId;
    const update = await Category.findByPk(id);
    const businessError = new BusinessError(400, "Bad Request");
    
    if (!update) {
      const notFoundError = new BusinessError(404, "Not Found");
      notFoundError.addError("data", `Category with id ${id} not found`);
      throw notFoundError;
    }
    
    // Check name uniqueness if name is being updated
    if (req.body.name && req.body.name !== update.name) {
      const existingCategory = await Category.findOne({ where: { name: req.body.name } });
      if (existingCategory) {
        businessError.addError("attributes.name", "Name already exists. Name must be unique");
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    // Only update the fields that are provided in the request
    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;

    const updated = await update.update(updateData);
    const serializedData = CategorySerializer.serialize(updated);
    res.status(200).json(serializedData);

  } catch (error) {
    next(error instanceof BusinessError ? error : new TechnicalError(500, "Internal Server Error", error.message));
  }
}

exports.deleteCategory = async (req, res, next) => {
  try {
    const id = req.params.categoryId;
    const category = await Category.findByPk(id);
    
    if (!category) {
      const notFoundError = new BusinessError(404, "Not Found");
      notFoundError.addError("data", `Category with id ${id} not found`);
      throw notFoundError;
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
    next(error instanceof BusinessError ? error : new TechnicalError(500, "Internal Server Error", error.message));
  }
}
