'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove existing foreign key constraints and add them back with CASCADE DELETE
    
    // 1. Sections table - category_id foreign key
    await queryInterface.sequelize.query(`
      ALTER TABLE sections 
      DROP CONSTRAINT IF EXISTS sections_category_id_fkey;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE sections 
      ADD CONSTRAINT sections_category_id_fkey 
      FOREIGN KEY (category_id) 
      REFERENCES categories(id) 
      ON UPDATE CASCADE 
      ON DELETE CASCADE;
    `);

    // 2. Questions table - section_id foreign key
    await queryInterface.sequelize.query(`
      ALTER TABLE questions 
      DROP CONSTRAINT IF EXISTS questions_section_id_fkey;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE questions 
      ADD CONSTRAINT questions_section_id_fkey 
      FOREIGN KEY (section_id) 
      REFERENCES sections(id) 
      ON UPDATE CASCADE 
      ON DELETE CASCADE;
    `);

    // 3. Result_categories table - category_id foreign key
    await queryInterface.sequelize.query(`
      ALTER TABLE result_categories 
      DROP CONSTRAINT IF EXISTS result_categories_category_id_fkey;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE result_categories 
      ADD CONSTRAINT result_categories_category_id_fkey 
      FOREIGN KEY (category_id) 
      REFERENCES categories(id) 
      ON UPDATE CASCADE 
      ON DELETE CASCADE;
    `);

    // 4. Result_categories table - result_id foreign key
    await queryInterface.sequelize.query(`
      ALTER TABLE result_categories 
      DROP CONSTRAINT IF EXISTS result_categories_result_id_fkey;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE result_categories 
      ADD CONSTRAINT result_categories_result_id_fkey 
      FOREIGN KEY (result_id) 
      REFERENCES results(id) 
      ON UPDATE CASCADE 
      ON DELETE CASCADE;
    `);

    // 5. Result_sections table - section_id foreign key
    await queryInterface.sequelize.query(`
      ALTER TABLE result_sections 
      DROP CONSTRAINT IF EXISTS result_sections_section_id_fkey;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE result_sections 
      ADD CONSTRAINT result_sections_section_id_fkey 
      FOREIGN KEY (section_id) 
      REFERENCES sections(id) 
      ON UPDATE CASCADE 
      ON DELETE CASCADE;
    `);

    // 6. Result_sections table - result_id foreign key
    await queryInterface.sequelize.query(`
      ALTER TABLE result_sections 
      DROP CONSTRAINT IF EXISTS result_sections_result_id_fkey;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE result_sections 
      ADD CONSTRAINT result_sections_result_id_fkey 
      FOREIGN KEY (result_id) 
      REFERENCES results(id) 
      ON UPDATE CASCADE 
      ON DELETE CASCADE;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert to no cascade delete (or whatever was before)
    
    // 1. Sections table
    await queryInterface.sequelize.query(`
      ALTER TABLE sections 
      DROP CONSTRAINT IF EXISTS sections_category_id_fkey;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE sections 
      ADD CONSTRAINT sections_category_id_fkey 
      FOREIGN KEY (category_id) 
      REFERENCES categories(id) 
      ON UPDATE CASCADE;
    `);

    // 2. Questions table
    await queryInterface.sequelize.query(`
      ALTER TABLE questions 
      DROP CONSTRAINT IF EXISTS questions_section_id_fkey;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE questions 
      ADD CONSTRAINT questions_section_id_fkey 
      FOREIGN KEY (section_id) 
      REFERENCES sections(id) 
      ON UPDATE CASCADE;
    `);

    // 3. Result_categories - category_id
    await queryInterface.sequelize.query(`
      ALTER TABLE result_categories 
      DROP CONSTRAINT IF EXISTS result_categories_category_id_fkey;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE result_categories 
      ADD CONSTRAINT result_categories_category_id_fkey 
      FOREIGN KEY (category_id) 
      REFERENCES categories(id) 
      ON UPDATE CASCADE;
    `);

    // 4. Result_categories - result_id
    await queryInterface.sequelize.query(`
      ALTER TABLE result_categories 
      DROP CONSTRAINT IF EXISTS result_categories_result_id_fkey;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE result_categories 
      ADD CONSTRAINT result_categories_result_id_fkey 
      FOREIGN KEY (result_id) 
      REFERENCES results(id) 
      ON UPDATE CASCADE;
    `);

    // 5. Result_sections - section_id
    await queryInterface.sequelize.query(`
      ALTER TABLE result_sections 
      DROP CONSTRAINT IF EXISTS result_sections_section_id_fkey;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE result_sections 
      ADD CONSTRAINT result_sections_section_id_fkey 
      FOREIGN KEY (section_id) 
      REFERENCES sections(id) 
      ON UPDATE CASCADE;
    `);

    // 6. Result_sections - result_id
    await queryInterface.sequelize.query(`
      ALTER TABLE result_sections 
      DROP CONSTRAINT IF EXISTS result_sections_result_id_fkey;
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TABLE result_sections 
      ADD CONSTRAINT result_sections_result_id_fkey 
      FOREIGN KEY (result_id) 
      REFERENCES results(id) 
      ON UPDATE CASCADE;
    `);
  }
};
