const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');

// User İlişkileri
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

// Category - Product İlişkileri
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// Product - Review İlişkileri
Product.hasMany(Review, { foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// Order - Product İlişkileri (Many-to-Many, OrderItem sayesinde)
Order.belongsToMany(Product, { through: OrderItem, foreignKey: 'orderId' });
Product.belongsToMany(Order, { through: OrderItem, foreignKey: 'productId' });

// OrderItem İlişkileri
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

module.exports = {
    sequelize,
    User,
    Category,
    Product,
    Order,
    OrderItem,
    Review,
};
