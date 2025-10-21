'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'qr_code_url', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'wallet_qr_code'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'qr_code_url');
  }
};