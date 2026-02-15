const BusinessError = require( "../error/BusinessError.js");
const NotFoundError = require( "../error/exception/NotFound.js");
const { Op } = require( "sequelize");

const config = {
  limit: 10,
};


const processFilters = (filterParams, allowedFields) => {
  const whereConditions = {};
  const errors = [];

  const operatorMap = {
    eq: Op.eq,
    ne: Op.ne,
    gt: Op.gt,
    gte: Op.gte,
    lt: Op.lt,
    lte: Op.lte,
    in: Op.in,
    nin: Op.notIn,
    contains: Op.like,
    startsWith: Op.startsWith,
    endsWith: Op.endsWith,
  };

  for (const [key, value] of Object.entries(filterParams)) {
    if (!allowedFields.includes(key)) {
      errors.push(
        `Filter parameter "${key}" is not a valid field. Allowed values: ${allowedFields.join(
          ", "
        )}`
      );
      continue;
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      whereConditions[key] = processOperatorObject(value, operatorMap);
    } else {
      whereConditions[key] = processDirectValue(value);
    }
  }

  return { whereConditions, errors };
};

const processDirectValue = (value) => {
  if (value === "null") {
    return null;
  }

  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }

  if (typeof value === "string" && value.includes(",")) {
    return { [Op.in]: value.split(",") };
  }

  return value;
};

const processOperatorObject = (opObject, operatorMap) => {
  const condition = {};

  for (const [op, val] of Object.entries(opObject)) {
    if (!operatorMap[op]) {
      throw new Error(`Unsupported operator: ${op}`);
    }

    if (op === "contains") {
      condition[operatorMap[op]] = `%${val}%`;
    } else if (op === "startsWith") {
      condition[operatorMap[op]] = `${val}%`;
    } else if (op === "endsWith") {
      condition[operatorMap[op]] = `%${val}`;
    } else if (op === "in" || op === "nin") {
      condition[operatorMap[op]] =
        typeof val === "string" ? val.split(",") : val;
    } else if (val === "null") {
      if (op === "eq") {
        condition[Op.is] = null;
      } else if (op === "ne") {
        condition[Op.not] = null;
      } else {
        condition[operatorMap[op]] = val;
      }
    } else {
      condition[operatorMap[op]] = val;
    }
  }

  return condition;
};

const createCrudOperations = ({
  Model,
  modelName,
  Serializer,
  InlineSerializer = null,
  allowedIncludes = [],
  allowedFields = [],
  defaultIncludes = [],
  uniqueField = null,
  parentIdField = null,
}) => ({
  getAllWithPagination: async (req, res, next) => {
    try {
      let whereCondition = {};
      let include = [];
      const businessError = new BusinessError(
        400,
        "BAD_REQUEST",
        "Validation error"
      );

      // Add parent ID filter if specified
      if (parentIdField && req.params[parentIdField]) {
        whereCondition[parentIdField] = req.params[parentIdField];
      }

      const pageSize = req.query["page"]?.["size"]
        ? parseInt(req.query["page"]["size"], 10)
        : config.limit;
      const pageNumber = req.query["page"]?.["number"]
        ? parseInt(req.query["page"]["number"], 10)
        : 0;

      // Check if returning all elements (pageSize === -1)
      const returnAll = pageSize === -1;

      if (
        isNaN(pageSize) ||
        isNaN(pageNumber) ||
        (pageSize < 1 && pageSize !== -1) ||
        pageNumber < 0
      ) {
        businessError.addError(
          "page",
          "Page size must be greater than 0 (or -1 for all elements) and page number must be non-negative"
        );
      }
      const offset = returnAll ? 0 : pageNumber * pageSize;

      // Handle includes
      let hasIncludes = false;
      if (req.query.include && allowedIncludes.length > 0) {
        const requestedIncludes = req.query.include.split(",");
        requestedIncludes.forEach((relation) => {
          if (!allowedIncludes.includes(relation)) {
            businessError.addError(
              "include",
              `Invalid include parameter: ${relation}. Allowed values: ${allowedIncludes.join(
                ", "
              )}`
            );
          } else {
            // Add valid include to the include array
            include.push({ association: relation });
            hasIncludes = true;
          }
        });
      }

      // Handle field selection
      let attributes = undefined;
      if (req.query.fields) {
        let fieldsArray = req.query.fields.split(",");

        const invalidFields = fieldsArray.filter(
          (field) => !allowedFields.includes(field)
        );
        if (invalidFields.length > 0) {
          businessError.addError(
            "fields",
            `Invalid fields requested: ${invalidFields.join(
              ", "
            )}. Allowed fields: ${allowedFields.join(", ")}`
          );
        } else {
          attributes = fieldsArray;
        }
        if (include.length > 0 || attributes) {
          if (attributes) {
            if (!attributes.includes("created_at")) attributes.push("created_at");
            if (!attributes.includes("updated_at")) attributes.push("updated_at");
            if (!attributes.includes("id")) attributes.push("id");
          }
        }
      }

      // Handle sorting
      let order = [];
      if (req.query.sort) {
        const sortFields = req.query.sort.split(",");
        const invalidSortFields = sortFields.filter(
          (field) => !allowedFields.includes(field.replace("-", ""))
        );

        if (invalidSortFields.length > 0) {
          businessError.addError(
            "fields",
            `Invalid sort fields requested: ${invalidSortFields.join(
              ", "
            )}. Allowed sort fields: ${allowedFields.join(", ")}`
          );
        } else {
          sortFields.forEach((field) => {
            const sortOrder = field.startsWith("-") ? "DESC" : "ASC";
            const sortField = field.replace("-", "");
            order.push([sortField, sortOrder]);

            if (attributes && !attributes.includes(sortField)) {
              attributes.push(sortField);
            }
          });
        }
      } else {

        if(modelName === "Question" )
          order.push(["level", "DESC"]);
        else 
          order.push(["created_at", "DESC"]);
      }

      // Handle filtering
      if (req.query.filter) {
        const { whereConditions, errors } = processFilters(
          req.query.filter,
          allowedFields
        );

        errors.forEach((error) => {
          businessError.addError("filter", error);
        });

        whereCondition = { ...whereCondition, ...whereConditions };
      }

      if (businessError.errors.length > 0) {
        throw businessError;
      }

      const [items, total_count] = await Promise.all([
        Model.findAll({
          attributes,
          order,
          offset,
          ...(returnAll ? {} : { limit: pageSize }),
          where: whereCondition,
          include,
          distinct: true,
        }),
        Model.count({
          where: whereCondition,
          include: include.length > 0 ? include : undefined,
          distinct: true,
        }),
      ]);
      const totalPages = returnAll ? 1 : Math.ceil(total_count / pageSize);
      const meta = {
        page_number: returnAll ? 0 : pageNumber,
        page_size: returnAll ? total_count : pageSize,
        total_count: total_count,
        total_pages: totalPages,
      };

      // Convert items to plain objects if they have toJSON method
      const itemsData = items.map(item => item.toJSON ? item.toJSON() : item);

      // Use inline serializer if includes are present and inline serializer is available
      let serializedData;
      if (hasIncludes && InlineSerializer) {
        serializedData = InlineSerializer.serialize(itemsData, meta);
      } else {
        serializedData = Serializer.serialize(itemsData);
        serializedData.meta = meta;
      }

      res.json(serializedData);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      let whereCondition = { id };
      let include = [...defaultIncludes];
      let hasIncludes = defaultIncludes.length > 0;

      // Add parent ID filter if specified
      if (parentIdField && req.params[parentIdField]) {
        whereCondition[parentIdField] = req.params[parentIdField];
      }

      // Handle includes for getById
      if (req.query.include && allowedIncludes.length > 0) {
        const requestedIncludes = req.query.include.split(",");
        const businessError = new BusinessError(
          400,
          "BAD_REQUEST",
          "Validation error"
        );

        requestedIncludes.forEach((relation) => {
          if (!allowedIncludes.includes(relation)) {
            businessError.addError(
              "include",
              `Invalid include parameter: ${relation}. Allowed values: ${allowedIncludes.join(
                ", "
              )}`
            );
          } else {
            // Add valid include to the include array if not already present
            if (!include.some(inc => inc.association === relation)) {
              include.push({ association: relation });
              hasIncludes = true;
            }
          }
        });

        if (businessError.errors.length > 0) {
          throw businessError;
        }
      }

      const item = await Model.findOne({
        where: whereCondition,
        include,
      });

      if (!item) {
        throw new NotFoundError(`${modelName} not found`, modelName);
      }

      // Convert to plain object if it has toJSON method
      const itemData = item.toJSON ? item.toJSON() : item;

      // Use inline serializer if includes are present and inline serializer is available
      let serializedData;
      if (hasIncludes && InlineSerializer) {
        serializedData = InlineSerializer.serialize(itemData);
      } else {
        serializedData = Serializer.serialize(itemData);
      }

      res.json(serializedData);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      // Add parent ID if specified
      if (parentIdField && req.params[parentIdField]) {
        req.body[parentIdField] = req.params[parentIdField];
      }

      const newItem = await Model.create(req.body);

      // Convert to plain object if it has toJSON method
      const itemData = newItem.toJSON ? newItem.toJSON() : newItem;
      let serializedData = Serializer.serialize(itemData);
      res.status(201).json(serializedData);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      let whereCondition = { id };

      // Add parent ID filter if specified
      if (parentIdField && req.params[parentIdField]) {
        whereCondition[parentIdField] = req.params[parentIdField];
      }

      const item = await Model.findOne({ where: whereCondition });

      if (!item) {
        throw new NotFoundError(`${modelName} not found`, modelName);
      }

      await item.update(req.body);

      // Convert to plain object if it has toJSON method
      const itemData = item.toJSON ? item.toJSON() : item;
      let serializedData = Serializer.serialize(itemData);
      res.json(serializedData);
    } catch (error) {
      next(error);
    }
  },

  remove: async (req, res, next) => {
    try {
      const { id } = req.params;
      let whereCondition = { id };

      // Add parent ID filter if specified
      if (parentIdField && req.params[parentIdField]) {
        whereCondition[parentIdField] = req.params[parentIdField];
      }

      const item = await Model.findOne({ where: whereCondition });

      if (!item) {
        throw new NotFoundError(`${modelName} not found`, modelName);
      }

      await item.destroy();

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
});

module.exports = { createCrudOperations };
