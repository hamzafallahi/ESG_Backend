const db = require('../models');
const Settings = db.settings;

const INTRODUCTION_KEY = 'results_intro_content';
const SUPPORTED_LANGUAGES = ['en', 'fr'];

const normalizeLanguage = (lang) => {
  if (typeof lang !== 'string') return 'en';
  return SUPPORTED_LANGUAGES.includes(lang.toLowerCase()) ? lang.toLowerCase() : 'en';
};

const normalizeLocalizedValue = (value) => ({
  title: typeof value?.title === 'string' ? value.title : '',
  first_paragraph: typeof value?.first_paragraph === 'string' ? value.first_paragraph : '',
  second_paragraph: typeof value?.second_paragraph === 'string' ? value.second_paragraph : '',
});

const normalizeStoredValue = (value) => {
  if (!value || typeof value !== 'object') {
    return {
      en: normalizeLocalizedValue(null),
      fr: normalizeLocalizedValue(null),
    };
  }

  // Backward compatibility with legacy flat payload shape.
  if ('title' in value || 'first_paragraph' in value || 'second_paragraph' in value) {
    return {
      en: normalizeLocalizedValue(value),
      fr: normalizeLocalizedValue(null),
    };
  }

  return {
    en: normalizeLocalizedValue(value.en),
    fr: normalizeLocalizedValue(value.fr),
  };
};

const toResponse = (value, exists, lang) => ({
  data: {
    type: 'results_introduction',
    id: INTRODUCTION_KEY,
    attributes: {
      ...normalizeLocalizedValue(value),
      exists,
      lang,
    },
  },
});

const getResultsIntroduction = async (req, res, next) => {
  try {
    const lang = normalizeLanguage(req.query.lang);
    const setting = await Settings.findOne({ where: { key: INTRODUCTION_KEY } });

    if (!setting) {
      return res.json(toResponse(null, false, lang));
    }

    const storedValue = normalizeStoredValue(setting.value);
    const localized = storedValue[lang] || storedValue.en;

    return res.json(toResponse(localized, true, lang));
  } catch (error) {
    next(error);
  }
};

const updateResultsIntroduction = async (req, res, next) => {
  try {
    const lang = normalizeLanguage(req.query.lang);

    const payload = {
      title: req.body.title,
      first_paragraph: req.body.first_paragraph,
      second_paragraph: req.body.second_paragraph,
    };

    let setting = await Settings.findOne({ where: { key: INTRODUCTION_KEY } });

    if (!setting) {
      const nextValue = {
        en: normalizeLocalizedValue(null),
        fr: normalizeLocalizedValue(null),
        [lang]: normalizeLocalizedValue(payload),
      };

      setting = await Settings.create({
        key: INTRODUCTION_KEY,
        value: nextValue,
      });
    } else {
      const currentValue = normalizeStoredValue(setting.value);
      const nextValue = {
        ...currentValue,
        [lang]: normalizeLocalizedValue(payload),
      };

      await setting.update({ value: nextValue });
    }

    const storedValue = normalizeStoredValue(setting.value);
    const localized = storedValue[lang] || storedValue.en;

    return res.json(toResponse(localized, true, lang));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResultsIntroduction,
  updateResultsIntroduction,
};
