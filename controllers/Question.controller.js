const BusinessError = require("../error/BusinessError");
const TechnicalError = require('../error/TechnicalError');
const db = require('../models');
const Question = db.question;
const Section = db.section;


const QuestionSerializer = require('../serializer/questionserializer.js');

exports.getAllQuestions = async(req, res, next) =>{
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
        Question.findAll({
          attributes,
          offset,
          limit: pageSize,
          where: whereCondition,
          order,
        }),
        Question.count({ where: whereCondition }),
      ]);
      const totalPages = Math.ceil(totalCount / pageSize);

      let serializedData = QuestionSerializer.serialize(items);
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

exports.getQuestionById = async (req, res, next) => {
  try {
    const id = req.params.questionId;
    
    let attributes = req.query.fields ? req.query.fields.split(",") : undefined;
    
    const question = await Question.findByPk(id, {
      attributes
    });
    
    if (!question) {
      const notFoundError = new BusinessError(404, "Not Found");
      notFoundError.addError("data", `Question with id ${id} not found`);
      throw notFoundError;
    }
    
    const serializedData = QuestionSerializer.serialize(question);
    res.status(200).json(serializedData);
    
  } catch (error) {
    next(error instanceof BusinessError ? error : new TechnicalError(500, "Internal Server Error", error.message));
  }
}

exports.getQuestionsBySection = async(req, res, next) =>{
    try {
        const sectionId = req.params.sectionId;
        let whereCondition = { section_id: sectionId };
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

      // Check if section exists
      const section = await Section.findByPk(sectionId);
      if (!section) {
        const notFoundError = new BusinessError(404, "Not Found");
        notFoundError.addError("data", `Section with id ${sectionId} not found`);
        throw notFoundError;
      }

      const [items, totalCount] = await Promise.all([
        Question.findAll({
          attributes,
          offset,
          limit: pageSize,
          where: whereCondition,
          order,
        }),
        Question.count({ where: whereCondition }),
      ]);
      const totalPages = Math.ceil(totalCount / pageSize);

      let serializedData = QuestionSerializer.serialize(items);
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

exports.createQuestion = async (req, res, next) => {
    try {
      const {text, score_value, section_id} = req.body;
      const sectionIdFromRoute = req.params.sectionId;

      const businessError = new BusinessError(400, "Bad Request");
      
      // Use section_id from route if available, otherwise from body
      const finalSectionId = sectionIdFromRoute || section_id;
      
      // Check if section exists
      if (finalSectionId) {
        const section = await Section.findByPk(finalSectionId);
        if (!section) {
          businessError.addError("attributes.section_id", "Section does not exist");
        }
      }

      // Validate score_value
      if (score_value !== undefined && (score_value < 0 || !Number.isInteger(score_value))) {
        businessError.addError("attributes.score_value", "Score value must be a non-negative integer");
      }

      if (businessError.errors.length > 0) throw businessError;

      // Prepare data for creation
      const createData = {
        text,
        score_value,
        section_id: finalSectionId
      };

      const question = await Question.create(createData);
      const serializedData = QuestionSerializer.serialize(question);
      res.status(201).json(serializedData);

    } catch (error) {
        next(error instanceof BusinessError ? error : new TechnicalError(500, "Internal Server Error", error.message));
    }
  }

exports.updateQuestion = async (req, res, next) => {
  try {
    const id = req.params.questionId;
    const update = await Question.findByPk(id);
    const businessError = new BusinessError(400, "Bad Request");
    
    if (!update) {
      const notFoundError = new BusinessError(404, "Not Found");
      notFoundError.addError("data", `Question with id ${id} not found`);
      throw notFoundError;
    }

    // Validate score_value if being updated
    if (req.body.score_value !== undefined && (req.body.score_value < 0 || !Number.isInteger(req.body.score_value))) {
      businessError.addError("attributes.score_value", "Score value must be a non-negative integer");
    }

    if (businessError.errors.length > 0) throw businessError;

    // Only update the fields that are provided in the request
    const updateData = {};
    if (req.body.text !== undefined) updateData.text = req.body.text;
    if (req.body.score_value !== undefined) updateData.score_value = req.body.score_value;

    const updated = await update.update(updateData);
    const serializedData = QuestionSerializer.serialize(updated);
    res.status(200).json(serializedData);

  } catch (error) {
    next(error instanceof BusinessError ? error : new TechnicalError(500, "Internal Server Error", error.message));
  }
}

exports.deleteQuestion = async (req, res, next) => {
  try {
    const id = req.params.questionId;
    const question = await Question.findByPk(id);
    
    if (!question) {
      const notFoundError = new BusinessError(404, "Not Found");
      notFoundError.addError("data", `Question with id ${id} not found`);
      throw notFoundError;
    }

    await question.destroy();
    res.status(204).send(); 
  } catch (error) {
    next(error instanceof BusinessError ? error : new TechnicalError(500, "Internal Server Error", error.message));
  }
}
