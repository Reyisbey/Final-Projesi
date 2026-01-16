const request = require('supertest');
const app = require('../../src/server');
const { sequelize } = require('../../src/models');

describe('E2E System Tests - Shopping Flow', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    // Clear DB before each test for independence
    beforeEach(async () => {
        await sequelize.sync({ force: true });
    });

    // Scenario 1: User Registration -> Product Search -> Order Creation
    it('Scenario 1: Full Shopping Flow', async () => {
        // 1. User Registration
        const userRes = await request(app).post('/api/users').send({
            name: 'System User',
            email: 'system@test.com',
            password: 'securepass'
        });
        expect(userRes.statusCode).toEqual(201);
        const userId = userRes.body.id;

        // 2. Admin adds products
        const p1 = await request(app).post('/api/products').send({ name: 'Mouse', price: 20, stock: 50 });
        const p2 = await request(app).post('/api/products').send({ name: 'Keyboard', price: 50, stock: 20 });
        const p1Id = p1.body.id;
        const p2Id = p2.body.id;

        // 3. User lists products
        const listRes = await request(app).get('/api/products');
        expect(listRes.statusCode).toEqual(200);
        expect(listRes.body.length).toBeGreaterThanOrEqual(2);

        // 4. User Creates Order
        const orderRes = await request(app).post('/api/orders').send({
            userId: userId,
            items: [
                { productId: p1Id, quantity: 2 },
                { productId: p2Id, quantity: 1 }
            ]
        });
        expect(orderRes.statusCode).toEqual(201);
        expect(Number(orderRes.body.totalAmount)).toEqual(90);
    });

    // Scenario 2: Product Lifecycle
    it('Scenario 2: Product Lifecycle (Create-Update-Delete)', async () => {
        const createRes = await request(app).post('/api/products').send({ name: 'Temp', price: 10, stock: 10 });
        const id = createRes.body.id;

        const updateRes = await request(app).put(`/api/products/${id}`).send({ price: 15 });
        expect(updateRes.statusCode).toEqual(200);

        const delRes = await request(app).delete(`/api/products/${id}`);
        expect(delRes.statusCode).toEqual(204);
    });

    // Scenario 3: Insufficient Stock
    it('Scenario 3: Insufficient Stock Flow', async () => {
        // Setup: Create User & Product
        const user = await request(app).post('/api/users').send({ name: 'Stock User', email: 'stock@test.com', password: '123' });
        const p = await request(app).post('/api/products').send({ name: 'Limited Item', price: 100, stock: 1 });

        const userId = user.body.id;
        const pId = p.body.id;

        // Order 1 (Success)
        await request(app).post('/api/orders').send({
            userId: userId,
            items: [{ productId: pId, quantity: 1 }]
        });

        // Order 2 (Fail)
        const order2 = await request(app).post('/api/orders').send({
            userId: userId,
            items: [{ productId: pId, quantity: 1 }]
        });
        expect(order2.statusCode).toEqual(400);
    });

    // Scenario 4: Order Cancellation
    it('Scenario 4: Order Cancellation Flow', async () => {
        // Setup
        const user = await request(app).post('/api/users').send({ name: 'Cancel User', email: 'cancel@test.com', password: '123' });
        const p = await request(app).post('/api/products').send({ name: 'Item', price: 50, stock: 10 });

        // Create Order
        const orderRes = await request(app).post('/api/orders').send({
            userId: user.body.id,
            items: [{ productId: p.body.id, quantity: 1 }]
        });
        const orderId = orderRes.body.id;

        // Cancel
        const updateRes = await request(app).put(`/api/orders/${orderId}`).send({ status: 'cancelled' });
        expect(updateRes.statusCode).toEqual(200);
        expect(updateRes.body.status).toEqual('cancelled');
    });

    // Scenario 5: User Review Flow
    it('Scenario 5: User Review Flow', async () => {
        // Setup
        const user = await request(app).post('/api/users').send({ name: 'Review User', email: 'review@test.com', password: '123' });
        const p = await request(app).post('/api/products').send({ name: 'Review Item', price: 50, stock: 10 });

        // Create Review
        const reviewRes = await request(app).post('/api/reviews').send({
            userId: user.body.id,
            productId: p.body.id,
            rating: 5,
            comment: 'Great product!'
        });
        expect(reviewRes.statusCode).toEqual(201);
    });
});
