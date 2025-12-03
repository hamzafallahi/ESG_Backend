const db = require('../models');
const Settings = db.settings;
const SettingsSerializer = require('../serializer/settingsserializer.js');
const SettingsInlineSerializer = require('../serializer/Settings.inline.serializer.js');
const { createCrudOperations } = require('../utils/crudOperations.js');
const NotFoundError = require('../error/exception/NotFound.js');
const BusinessError = require("../error/BusinessError");

const allowedFields = [
  "id",
  "key",
  "value",
  "created_at",
  "updated_at",
];

const crudOps = createCrudOperations({
  Model: Settings,
  modelName: "Settings",
  Serializer: SettingsSerializer,
  InlineSerializer: SettingsInlineSerializer,
  allowedIncludes: [],
  allowedFields,
  defaultIncludes: [],
  uniqueField: "key",
});

// Custom getAll with pagination
const getAllSettings = async (req, res, next) => {
  try {
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

const getSettingById = async (req, res, next) => {
  try {
    // Map settingId param to id for crudOps
    req.params.id = req.params.settingId;
    await crudOps.getById(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Get setting by key
const getSettingByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    
    const setting = await Settings.findOne({ where: { key } });

    if (!setting) {
      throw new NotFoundError("Setting not found", "Settings");
    }

    const itemData = setting.toJSON ? setting.toJSON() : setting;
    let serializedData = SettingsSerializer.serialize(itemData);

    res.json(serializedData);
  } catch (error) {
    next(error);
  }
};

const createSetting = async (req, res, next) => {
  try {
    const businessError = new BusinessError(400, "Bad Request");
    
    // Check for key uniqueness
    if (req.body.key) {
      const existingSetting = await Settings.findOne({ where: { key: req.body.key } });
      if (existingSetting) {
        businessError.addError("attributes.key", "Key already exists. Key must be unique");
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    await crudOps.create(req, res, next);
  } catch (error) {
    next(error);
  }
};

const updateSetting = async (req, res, next) => {
  try {
    const id = req.params.settingId;
    const setting = await Settings.findByPk(id);
    const businessError = new BusinessError(400, "Bad Request");
    
    if (!setting) {
      throw new NotFoundError("Setting not found", "Settings");
    }
    
    // Check key uniqueness if key is being updated
    if (req.body.key && req.body.key !== setting.key) {
      const existingSetting = await Settings.findOne({ where: { key: req.body.key } });
      if (existingSetting) {
        businessError.addError("attributes.key", "Key already exists. Key must be unique");
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    // Map settingId param to id for crudOps
    req.params.id = req.params.settingId;
    await crudOps.update(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Update setting by key
const updateSettingByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ where: { key } });
    
    if (!setting) {
      throw new NotFoundError("Setting not found", "Settings");
    }

    await setting.update(req.body);

    const itemData = setting.toJSON ? setting.toJSON() : setting;
    let serializedData = SettingsSerializer.serialize(itemData);
    res.json(serializedData);
  } catch (error) {
    next(error);
  }
};

const deleteSetting = async (req, res, next) => {
  try {
    const id = req.params.settingId;
    const setting = await Settings.findByPk(id);
    
    if (!setting) {
      throw new NotFoundError("Setting not found", "Settings");
    }

    // Map settingId param to id for crudOps
    req.params.id = req.params.settingId;
    await crudOps.remove(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSettings,
  getSettingById,
  getSettingByKey,
  createSetting,
  updateSetting,
  updateSettingByKey,
  deleteSetting,
};
