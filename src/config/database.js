const { Sequelize } = require('sequelize');
require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

// Use SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: isTest ? ':memory:' : './database.sqlite', // File path for the DB
    logging: false,
});

module.exports = sequelize;
