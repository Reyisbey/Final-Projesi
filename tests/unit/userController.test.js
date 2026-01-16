const userController = require('../../src/controllers/userController');
const { User, Order, Review } = require('../../src/models');

// Mock Sequelize models
jest.mock('../../src/models', () => ({
    User: {
        create: jest.fn(),
        findAll: jest.fn(),
        findByPk: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
    },
    Order: {},
    Review: {},
}));

describe('User Controller Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };
        jest.clearAllMocks();
    });

    // 1. Create User - Success
    it('should create a user successfully', async () => {
        const mockUser = { id: 1, name: 'Talat', email: 'talat@example.com' };
        req.body = mockUser;
        User.create.mockResolvedValue(mockUser);

        await userController.createUser(req, res);

        expect(User.create).toHaveBeenCalledWith(mockUser);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    // 2. Create User - Error
    it('should return 400 if validation fails', async () => {
        const errorMessage = 'Validation error';
        User.create.mockRejectedValue(new Error(errorMessage));

        await userController.createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });

    // 3. Get All Users - Success
    it('should return all users', async () => {
        const mockUsers = [{ id: 1, name: 'Talat' }];
        User.findAll.mockResolvedValue(mockUsers);

        await userController.getAllUsers(req, res);

        expect(User.findAll).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    // 4. Get User By ID - Found
    it('should return user by id', async () => {
        const mockUser = { id: 1, name: 'Talat' };
        req.params.id = 1;
        User.findByPk.mockResolvedValue(mockUser);

        await userController.getUserById(req, res);

        expect(User.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    // 5. Get User By ID - Not Found
    it('should return 404 if user not found', async () => {
        req.params.id = 999;
        User.findByPk.mockResolvedValue(null);

        await userController.getUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    // 6. Update User - Success
    it('should update user successfully', async () => {
        req.params.id = 1;
        req.body = { name: 'Ahmet' };
        User.update.mockResolvedValue([1]); // 1 row affected
        User.findByPk.mockResolvedValue({ id: 1, name: 'Ahmet' });

        await userController.updateUser(req, res);

        expect(User.update).toHaveBeenCalledWith(req.body, { where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Ahmet' });
    });

    // 7. Update User - Not Found
    it('should return 404 if user to update is not found', async () => {
        req.params.id = 999;
        User.update.mockResolvedValue([0]); // 0 rows affected

        await userController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    // 8. Delete User - Success
    it('should delete user successfully', async () => {
        req.params.id = 1;
        User.destroy.mockResolvedValue(1);

        await userController.deleteUser(req, res);

        expect(User.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(res.status).toHaveBeenCalledWith(204);
    });

    // 9. Delete User - Not Found
    it('should return 404 if user to delete is not found', async () => {
        req.params.id = 999;
        User.destroy.mockResolvedValue(0);

        await userController.deleteUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});
