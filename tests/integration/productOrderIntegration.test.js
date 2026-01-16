const request = require('supertest');
const app = require('../../src/server');
const { sequelize } = require('../../src/models');

describe('Product & Order Integration Tests', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    beforeEach(async () => {
        await sequelize.models.OrderItem.destroy({ where: {} });
        await sequelize.models.Order.destroy({ where: {} });
        await sequelize.models.Product.destroy({ where: {} });
        await sequelize.models.Category.destroy({ where: {} });
        await sequelize.models.User.destroy({ where: {} });
    });

    // --- Product Tests ---
    it('should create a product', async () => {
        const res = await request(app).post('/api/products').send({
            name: 'Test Product',
            price: 50.00,
            stock: 100
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body.name).toEqual('Test Product');
    });

    it('should get all products', async () => {
        await sequelize.models.Product.create({ name: 'P1', price: 10, stock: 10 });
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
    });

    // --- Order Tests ---
    it('should create an order with items', async () => {
        const user = await sequelize.models.User.create({ name: 'Buyer', email: 'buyer@test.com', password: '123' });
        const product = await sequelize.models.Product.create({ name: 'Laptop', price: 1000, stock: 5 });

        const res = await request(app).post('/api/orders').send({
            userId: user.id,
            items: [
                { productId: product.id, quantity: 2 }
            ]
        });

        expect(res.statusCode).toEqual(201);
        expect(res.body.totalAmount).toEqual(2000);
        expect(res.body.status).toEqual('pending');

        const updatedProduct = await sequelize.models.Product.findByPk(product.id);
        expect(updatedProduct.stock).toBe(3);
    });

    it('should fail to create order if insufficient stock', async () => {
        const user = await sequelize.models.User.create({ name: 'Buyer', email: 'buyer@test.com', password: '123' });
        const product = await sequelize.models.Product.create({ name: 'Phone', price: 500, stock: 1 });

        const res = await request(app).post('/api/orders').send({
            userId: user.id,
            items: [
                { productId: product.id, quantity: 2 } // Requesting 2, stock is 1
            ]
        });

        expect(res.statusCode).toEqual(400);
    });

    it('should get order details', async () => {
        const user = await sequelize.models.User.create({ name: 'Buyer', email: 'buyer2@test.com', password: '123' });
        const order = await sequelize.models.Order.create({ userId: user.id, totalAmount: 100 });

        const res = await request(app).get(`/api/orders/${order.id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.id).toEqual(order.id);
        expect(res.body.User.name).toEqual('Buyer');
    });
});
