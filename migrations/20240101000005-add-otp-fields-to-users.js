'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'email_verification_o_t_p', {
      type: Sequelize.STRING(6),
      allowNull: true,
      comment: 'Email verification OTP code (6 digits)'
    });

    await queryInterface.addColumn('users', 'otp_expires', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'OTP expiration timestamp'
    });

    await queryInterface.addColumn('users', 'otp_attempts', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of OTP verification attempts'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'email_verification_o_t_p');
    await queryInterface.removeColumn('users', 'otp_expires');
    await queryInterface.removeColumn('users', 'otp_attempts');
  }
};