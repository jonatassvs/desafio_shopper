'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Exemplo:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('measures', 'image_url', {
      type: Sequelize.STRING,
      allowNull: true,  // Permite valores nulos
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Exemplo:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('measures', 'image_url');
  }
};
