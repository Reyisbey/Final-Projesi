const orderController = require('../../src/controllers/orderController');
const { Order, OrderItem, Product } = require('../../src/models');

jest.mock('../../src/models', () => ({
    Order: { create: jest.fn(), findByPk: jest.fn() },
    OrderItem: { create: jest.fn() },
    Product: { findByPk: jest.fn(), update: jest.fn() },
    User: {},
}));

describe('Order Controller Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        jest.clearAllMocks();
    });

    // 13. Create Order - Insufficient Stock
    it('should return 400 if insufficient stock', async () => {
        req.body = { userId: 1, items: [{ productId: 1, quantity: 5 }] };
        Product.findByPk.mockResolvedValue({ id: 1, name: 'X', price: 10, stock: 2, update: jest.fn() });

        await orderController.createOrder(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Insufficient stock') }));
    });

    // 14. Create Order - Success
    it('should create order successfully', async () => {
        req.body = { userId: 1, items: [{ productId: 1, quantity: 1 }] };
        Product.findByPk.mockResolvedValue({ id: 1, name: 'X', price: 10, stock: 10, update: jest.fn() });

        Order.create.mockResolvedValue({ id: 101 });
        Order.findByPk.mockResolvedValue({ id: 101, totalAmount: 10 });

        await orderController.createOrder(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(Order.create).toHaveBeenCalled();
    });

    // 15. Create Order - No Items
    it('should return 400 if no items provided', async () => {
        req.body = { userId: 1, items: [] };
        await orderController.createOrder(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
