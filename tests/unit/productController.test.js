const productController = require('../../src/controllers/productController');
const { Product, Category, Review } = require('../../src/models');

jest.mock('../../src/models', () => ({
    Product: {
        create: jest.fn(),
        findAll: jest.fn(),
        findByPk: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
    },
    Category: {},
    Review: {},
}));

describe('Product Controller Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
        jest.clearAllMocks();
    });

    // 10. Create Product
    it('should create a product', async () => {
        const mockProduct = { id: 1, name: 'Laptop', price: 100 };
        req.body = mockProduct;
        Product.create.mockResolvedValue(mockProduct);

        await productController.createProduct(req, res);

        expect(Product.create).toHaveBeenCalledWith(mockProduct);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    // 11. Get Product By ID - Found
    it('should return product by id', async () => {
        const mockProduct = { id: 1, name: 'Phone' };
        req.params.id = 1;
        Product.findByPk.mockResolvedValue(mockProduct);

        await productController.getProductById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    // 12. Delete Product - Error
    it('should handle errors during deletion', async () => {
        req.params.id = 1;
        Product.destroy.mockRejectedValue(new Error('DB Error'));

        await productController.deleteProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
