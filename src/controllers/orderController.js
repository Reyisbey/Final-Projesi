const { Order, OrderItem, Product, User } = require('../models');

exports.createOrder = async (req, res) => {
    try {
        const { userId, items } = req.body;

        // Toplam Order sayısı
        let totalAmount = 0;
        const orderItemsData = [];

        // Basit item kontrolü
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must have items' });
        }

        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.productId} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
            }
            totalAmount += product.price * item.quantity;
            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price
            });

            // Stok güncellemesi
            await product.update({ stock: product.stock - item.quantity });
        }

        const order = await Order.create({
            userId,
            totalAmount,
            status: 'pending'
        });

        // Order oluşturma
        for (const data of orderItemsData) {
            await OrderItem.create({
                orderId: order.id,
                ...data
            });
        }

        const createdOrder = await Order.findByPk(order.id, {
            include: [{ model: OrderItem }]
        });

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [{ model: User, attributes: ['name', 'email'] }]
        });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: OrderItem, include: [Product] },
                { model: User, attributes: ['name', 'email'] }
            ]
        });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const [updated] = await Order.update(req.body, {
            where: { id: req.params.id }
        });
        if (!updated) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const updatedOrder = await Order.findByPk(req.params.id);
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const deleted = await Order.destroy({
            where: { id: req.params.id }
        });
        if (!deleted) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
