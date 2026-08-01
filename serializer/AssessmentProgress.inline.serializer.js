const { createInlineSerializer } = require('../utils/inlineSerializer');

const AssessmentProgressInlineSerializer = createInlineSerializer('assessment_progress', {
  attributes: [
    'user_id',
    'status',
    'result_id',
    'current_page',
    'ui_state',
    'total_questions',
    'answered_questions',
    'completion_percentage',
    'created_at',
    'updated_at'
  ],
  relationships: {
    user: {
      type: 'user',
      attributes: ['organization_name', 'phone_number', 'email', 'created_at', 'updated_at']
    }
  }
});

module.exports = AssessmentProgressInlineSerializer;
