const { createInlineSerializer } = require('../utils/inlineSerializer');

const baseSerializer = createInlineSerializer('section', {
  attributes: [
    'category_id',
    'title',
    'title_fr', 
    'description',
    'core',
    'created_at', 
    'updated_at', 
    'deleted_at'
  ],
  relationships: {
    category: {
      type: 'category',
      attributes: ['name', 'name_fr', 'description', 'created_at', 'updated_at']
    },
    questions: {
      type: 'question',
      attributes: ['section_id', 'text', 'text_fr', 'score_value', 'level', 'created_at', 'updated_at'],
      relationships: {
        rscis: {
          type: 'rsci',
          attributes: ['code', 'title', 'title_fr', 'created_at', 'updated_at']
        }
      }
    },
    result_sections: {
      type: 'result_section',
      attributes: ['result_id', 'section_id', 'score', 'created_at', 'updated_at']
    }
  }
});

const sortSectionQuestionsByLevel = (input) => {
  const sections = Array.isArray(input) ? input : [input];

  sections.forEach((section) => {
    if (!section || !Array.isArray(section.questions)) {
      return;
    }

    section.questions.sort((a, b) => {
      const aLevel = Number(a.level ?? a.dataValues?.level ?? 0);
      const bLevel = Number(b.level ?? b.dataValues?.level ?? 0);
      if (aLevel !== bLevel) return aLevel - bLevel;

      const aCreatedAt = new Date(a.created_at ?? a.dataValues?.created_at ?? 0).getTime();
      const bCreatedAt = new Date(b.created_at ?? b.dataValues?.created_at ?? 0).getTime();
      return aCreatedAt - bCreatedAt;
    });
  });
};

const SectionInlineSerializer = {
  serialize: (data, meta = null) => {
    sortSectionQuestionsByLevel(data);
    return baseSerializer.serialize(data, meta);
  }
};

module.exports = SectionInlineSerializer;