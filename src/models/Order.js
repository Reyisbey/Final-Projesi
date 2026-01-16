const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        defaultValue: 'pending',
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
    },
}, {
    timestamps: true,
});

module.exports = Order;
