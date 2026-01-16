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

        // 2. Admin adds products (Simulated)
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
                { productId: p1Id, quantity: 2 }, // 2 * 20 = 40
                { productId: p2Id, quantity: 1 }  // 1 * 50 = 50
            ]
        });
        expect(orderRes.statusCode).toEqual(201);
        expect(Number(orderRes.body.totalAmount)).toEqual(90);
        const orderId = orderRes.body.id;

        // 5. Verify Order Details
        const verifyRes = await request(app).get(`/api/orders/${orderId}`);
        expect(verifyRes.statusCode).toEqual(200);
        expect(verifyRes.body.status).toEqual('pending');
        expect(verifyRes.body.OrderItems.length).toBe(2);
    });

    // Scenario 2: Product Lifecycle
    it('Scenario 2: Product Lifecycle (Create-Update-Delete)', async () => {
        // Create
        const createRes = await request(app).post('/api/products').send({ name: 'Temp', price: 10, stock: 10 });
        const id = createRes.body.id;

        // Update
        const updateRes = await request(app).put(`/api/products/${id}`).send({ price: 15 });
        expect(updateRes.statusCode).toEqual(200);
        expect(Number(updateRes.body.price)).toEqual(15);

        // Delete
        const delRes = await request(app).delete(`/api/products/${id}`);
        expect(delRes.statusCode).toEqual(204);

        // Verify Gone
        const getRes = await request(app).get(`/api/products/${id}`);
        expect(getRes.statusCode).toEqual(404);
    });


    // Scenario 3: Insufficient Stock
    it('Scenario 3: Insufficient Stock Flow', async () => {
        // Create product with limited stock
        const p = await request(app).post('/api/products').send({ name: 'Limited Item', price: 100, stock: 1 });
        const pId = p.body.id;
        const userId = 1; // Assuming user from prior test exists or we use a fresh one if db reset

        // Order 1 (Success)
        const order1 = await request(app).post('/api/orders').send({
            userId: userId,
            items: [{ productId: pId, quantity: 1 }]
        });
        expect(order1.statusCode).toEqual(201);

        // Order 2 (Fail - Out of stock)
        const order2 = await request(app).post('/api/orders').send({
            userId: userId,
            items: [{ productId: pId, quantity: 1 }]
        });
        expect(order2.statusCode).toEqual(400);
        expect(order2.body.message).toMatch(/Insufficient stock/);
    });

    // Scenario 4: Order Cancellation
    it('Scenario 4: Order Cancellation Flow', async () => {
        // Create order
        const orderRes = await request(app).post('/api/orders').send({
            userId: 1,
            items: [{ productId: 1, quantity: 1 }] // Assuming product 1 exists and has stock
        });
        const orderId = orderRes.body.id;

        // Cancel Order
        const updateRes = await request(app).put(`/api/orders/${orderId}`).send({ status: 'cancelled' });
        expect(updateRes.statusCode).toEqual(200);
        expect(updateRes.body.status).toEqual('cancelled');
    });

    // Scenario 5: User Review Flow
    it('Scenario 5: User Review Flow', async () => {
        // Create Review
        const reviewRes = await request(app).post('/api/reviews').send({
            userId: 1,
            productId: 1,
            rating: 5,
            comment: 'Great product!'
        });
        expect(reviewRes.statusCode).toEqual(201);
        const reviewId = reviewRes.body.id;

        // Verify Review exists
        const getRes = await request(app).get(`/api/reviews/${reviewId}`);
        expect(getRes.statusCode).toEqual(200);
        expect(getRes.body.comment).toEqual('Great product!');
    });
});
