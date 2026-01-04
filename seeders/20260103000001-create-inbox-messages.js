'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const userId = '35a37b7e-bbe3-4b74-ab13-d1782cc4bf74';
    const now = new Date();
    
    // Helper to create dates in the past
    const daysAgo = (days) => {
      const date = new Date(now);
      date.setDate(date.getDate() - days);
      return date;
    };

    const inboxMessages = [
      // ============ RETAKE REQUESTS ============
      {
        id: uuidv4(),
        sent_by_user_id: userId,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'retake_request',
        payload: JSON.stringify({
        }),
        status: null,
        created_at: daysAgo(1),
        updated_at: daysAgo(1)
      },
      {
        id: uuidv4(),
        sent_by_user_id: userId,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'retake_request',
        payload: JSON.stringify({
          reason: 'Our company has implemented new environmental policies. We believe our score should reflect these changes.',
          //user_organization: 'Green Tech Solutions'
        }),
        status: 'resolved',
        created_at: daysAgo(15),
        updated_at: daysAgo(14)
      },
      {
        id: uuidv4(),
        sent_by_user_id: userId,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'retake_request',
        payload: JSON.stringify({
          reason: 'We have completed our annual sustainability audit and achieved new certifications.',
          //user_organization: 'Green Tech Solutions'
        }),
        status: null,
        created_at: daysAgo(3),
        updated_at: daysAgo(3)
      },

      // ============ CONTACT US ============
      {
        id: uuidv4(),
        sent_by_user_id: userId,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'contact_us',
        payload: JSON.stringify({
          subject: 'Question about ESG Assessment Criteria',
          message: 'Hello, I would like to understand more about how the environmental criteria are weighted in the assessment. Can you provide more details on the methodology?'
        }),
        status: null,
        created_at: daysAgo(2),
        updated_at: daysAgo(2)
      },
      {
        id: uuidv4(),
        sent_by_user_id: userId,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'contact_us',
        payload: JSON.stringify({
          subject: 'Partnership Inquiry',
          organization_name: 'Green Tech Solutions',
          email: 'partnerships@greentech.com',
          message: 'We are interested in exploring partnership opportunities with your organization. Our company specializes in sustainable technology solutions and we believe there could be synergies.'
        }),
        status: null,
        created_at: daysAgo(20),
        updated_at: daysAgo(18)
      },
      {
        id: uuidv4(),
        sent_by_user_id: null,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'contact_us',
        payload: JSON.stringify({
          subject: 'Inquiry from Potential User',
          organization_name: 'EcoStart Ventures',
          email: 'info@ecostart.com',
          message: 'We are a startup focused on eco-friendly products. We would like to know more about your ESG assessment platform and pricing options.'
        }),
        status: null,
        created_at: daysAgo(5),
        updated_at: daysAgo(5)
      },

      // ============ BUG REPORTS ============
      {
        id: uuidv4(),
        sent_by_user_id: userId,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'bug_report',
        payload: JSON.stringify({
          category: 'UI/UX',
          subject: 'Dashboard charts not loading on mobile',
          //organization_name: 'Green Tech Solutions',
          //email: 'support@greentech.com',
          message: 'When viewing the dashboard on mobile devices (iPhone 14, Safari), the charts fail to load and show a blank area. This happens consistently after logging in.'
        }),
        status: null,
        created_at: daysAgo(1),
        updated_at: daysAgo(1)
      },
      {
        id: uuidv4(),
        sent_by_user_id: userId,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'bug_report',
        payload: JSON.stringify({
          category: 'Assessment',
          subject: 'Progress not saved when navigating back',
          organization_name: 'Green Tech Solutions',
          email: 'tech@greentech.com',
          message: 'During the assessment, if I navigate back to a previous section using the browser back button, my progress in the current section is lost. Expected behavior: progress should be auto-saved.'
        }),
        status: null,
        created_at: daysAgo(30),
        updated_at: daysAgo(25)
      },
      {
        id: uuidv4(),
        sent_by_user_id: userId,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'bug_report',
        payload: JSON.stringify({
          category: 'Performance',
          subject: 'Slow loading times on results page',
          //organization_name: 'Green Tech Solutions',
          //email: 'dev@greentech.com',
          message: 'The results page takes over 10 seconds to load after completing an assessment. Other pages load quickly, so this seems specific to the results page.'
        }),
        status: null,
        created_at: daysAgo(4),
        updated_at: daysAgo(4)
      },

      // ============ SUPPORT REQUESTS ============
      {
        id: uuidv4(),
        sent_by_user_id: userId,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'support_request',
        payload: JSON.stringify({
          category: 'Account',
          subject: 'Need help resetting assessment data',
          //organization_name: 'Green Tech Solutions',
          //email: 'admin@greentech.com',
          message: 'We need to reset our assessment data to start fresh. Our organization has undergone significant restructuring and the previous data is no longer relevant.'
        }),
        status: null,
        created_at: daysAgo(1),
        updated_at: daysAgo(1)
      },
      {
        id: uuidv4(),
        sent_by_user_id: userId,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'support_request',
        payload: JSON.stringify({
          category: 'Technical',
          subject: 'Cannot export report to PDF',
          organization_name: 'Green Tech Solutions',
          email: 'reports@greentech.com',
          message: 'When I try to export the ESG report to PDF, I get an error message saying "Export failed". I have tried multiple browsers (Chrome, Firefox, Edge) with the same result.'
        }),
        status: null,
        created_at: daysAgo(12),
        updated_at: daysAgo(10)
      },
      {
        id: uuidv4(),
        sent_by_user_id: userId,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'support_request',
        payload: JSON.stringify({
          category: 'Billing',
          subject: 'Question about subscription renewal',
          organization_name: 'Green Tech Solutions',
          email: 'billing@greentech.com',
          message: 'Our subscription is expiring next month. Can you provide information about renewal options and any available discounts for long-term commitments?'
        }),
        status: null,
        created_at: daysAgo(6),
        updated_at: daysAgo(6)
      },

      // ============ RESULT FEEDBACK ============
      {
        id: uuidv4(),
        sent_by_user_id: userId,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'result_feedback',
        payload: JSON.stringify({
          result_id: 'c878e7bd-51f0-4d32-bd29-dd1fccf4658c'
          //organization_name: 'Green Tech Solutions',
          //email: 'feedback@greentech.com',
          }),
        status: null,
        created_at: daysAgo(2),
        updated_at: daysAgo(2)
      },
      {
        id: uuidv4(),
        sent_by_user_id: userId,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'result_feedback',
        payload: JSON.stringify({
          result_id: 'cc51f4b9-d3e8-4d8f-9fe8-26d030ef9a6a'
    }),
        status: null,
        created_at: daysAgo(45),
        updated_at: daysAgo(40)
      },
      {
        id: uuidv4(),
        sent_by_user_id: userId,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'result_feedback',
        payload: JSON.stringify({
          result_id: '325ab725-63fa-4859-a8d5-0c73c515821b'
          }),
        status: null,
        created_at: daysAgo(8),
        updated_at: daysAgo(8)
      },

      // ============ ADDITIONAL VARIETY - Different statuses and recent messages ============
      /*{
        id: uuidv4(),
        sent_by_user_id: userId,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'contact_us',
        payload: JSON.stringify({
          subject: 'Urgent: API Integration Question',
          organization_name: 'Green Tech Solutions',
          email: 'api@greentech.com',
          message: 'We are developing an integration with your platform. Is there an API documentation available? We need to pull ESG scores programmatically for our internal dashboard.'
        }),
        status: null,
        created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        updated_at: new Date(now.getTime() - 2 * 60 * 60 * 1000)
      },
      {
        id: uuidv4(),
        sent_by_user_id: userId,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'bug_report',
        payload: JSON.stringify({
          category: 'Authentication',
          subject: 'Session expires too quickly',
          organization_name: 'Green Tech Solutions',
          email: 'security@greentech.com',
          message: 'My session seems to expire after only 15 minutes of inactivity. This is disruptive when filling out long assessment forms. Can the timeout be extended?'
        }),
        status: null,
        created_at: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
        updated_at: new Date(now.getTime() - 30 * 60 * 1000)
      },
      {
        id: uuidv4(),
        sent_by_user_id: userId,
        sent_by_admin_id: null,
        sent_by_super_admin_id: null,
        type: 'support_request',
        payload: JSON.stringify({
          category: 'Data',
          subject: 'Request for historical data export',
          organization_name: 'Green Tech Solutions',
          email: 'data@greentech.com',
          message: 'For our annual sustainability report, we need to export all historical assessment data from the past 3 years. Is this possible through the platform?'
        }),
        status: null,
        created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
        updated_at: new Date(now.getTime() - 4 * 60 * 60 * 1000)
      }*/
    ];

    await queryInterface.bulkInsert('inbox_messages', inboxMessages);
  },

  async down(queryInterface, Sequelize) {
    // Delete all seeded messages (by the specific user or visitor messages)
    const userId = '35a37b7e-bbe3-4b74-ab13-d1782cc4bf74';
    
    await queryInterface.bulkDelete('inbox_messages', {
      [Sequelize.Op.or]: [
        { sent_by_user_id: userId },
        {
          sent_by_user_id: null,
          sent_by_admin_id: null,
          sent_by_super_admin_id: null
        }
      ]
    }, {});
  }
};
