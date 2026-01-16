const request = require('supertest');
const app = require('../../src/server');
const { sequelize } = require('../../src/models');

describe('User Integration Tests', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    beforeEach(async () => {
        await sequelize.models.User.destroy({ where: {} });
    });

    // 1. POST /api/users (Create User)
    it('should create a new user', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({
                name: 'Integration Test User',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toEqual('test@example.com');
    });

    // 2. GET /api/users (Get All)
    it('should fetch all users', async () => {
        await sequelize.models.User.create({
            name: 'Test User',
            email: 'fetch@example.com',
            password: 'password'
        });

        const res = await request(app).get('/api/users');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBe(1);
    });

    // 3. GET /api/users/:id (Get Single)
    it('should fetch single user by id', async () => {
        const user = await sequelize.models.User.create({
            name: 'Single User',
            email: 'single@example.com',
            password: 'password'
        });

        const res = await request(app).get(`/api/users/${user.id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toEqual('Single User');
    });

    // 4. PUT /api/users/:id (Update)
    it('should update a user', async () => {
        const user = await sequelize.models.User.create({
            name: 'Update User',
            email: 'update@example.com',
            password: 'password'
        });

        const res = await request(app)
            .put(`/api/users/${user.id}`)
            .send({ name: 'Updated Name' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toEqual('Updated Name');
    });

    // 5. DELETE /api/users/:id (Delete)
    it('should delete a user', async () => {
        const user = await sequelize.models.User.create({
            name: 'Delete User',
            email: 'delete@example.com',
            password: 'password'
        });

        const res = await request(app).delete(`/api/users/${user.id}`);
        expect(res.statusCode).toEqual(204);

        const check = await sequelize.models.User.findByPk(user.id);
        expect(check).toBeNull();
    });

    // 6. Error Handling: GET /api/users/:id (Not Found)
    it('should return 404 when user does not exist', async () => {
        const res = await request(app).get('/api/users/99999');
        expect(res.statusCode).toEqual(404);
    });

    // 7. Error Handling: Internal Server Error (500)
    it('should return 500 if database fails', async () => {
        const findAllMock = jest.spyOn(sequelize.models.User, 'findAll').mockRejectedValue(new Error('DB Error'));

        const res = await request(app).get('/api/users');
        expect(res.statusCode).toEqual(500);

        findAllMock.mockRestore();
    });
});
