'use strict';

const {Op} = require('sequelize');
const bcrypt = require('bcryptjs');
const {Role} = require('../../app/models');
const admin = require('../../config/admin');

const names = [
  'Johnny',
  'Fikri',
  'Brian',
  'Ranggawarsita',
  'Jayabaya',
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const password = '123456';
    const encryptedPassword = bcrypt.hashSync(password, 10);
    const timestamp = new Date();

    const role = await Role.findOne({
      where: {
        name: 'CUSTOMER',
      },
    });

    const roleAdmin = await Role.findOne({
      where: {
        name: 'ADMIN',
      },
    });

    const users = names.map((name) => ({
      name,
      email: `${name.toLowerCase()}@binar.co.id`,
      encryptedPassword,
      roleId: role.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));
    users.push({
      name: admin.name,
      email: admin.email,
      encryptedPassword: bcrypt.hashSync(admin.password, 10),
      roleId: roleAdmin.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    await queryInterface.bulkInsert('Users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {name: {[Op.in]: names}}, {});
  },
};
