const { Serializer } = require('jsonapi-serializer');

const AssessmentProgressSerializer = new Serializer('assessment_progress', {
  attributes: [
    'user_id',
    'answers',
    'current_page',
    'ui_state',
    'total_questions',
    'answered_questions',
    'completion_percentage',
    'created_at',
    'updated_at',
    'user'
  ],
  keyForAttribute: 'snake_case',
  user: {
    ref: 'id',
    attributes: ['organization_name', 'phone_number', 'email', 'created_at', 'updated_at']
  }
});

module.exports = AssessmentProgressSerializer;
