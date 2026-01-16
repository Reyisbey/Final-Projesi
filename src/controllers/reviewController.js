const { Review, Product, User } = require('../models');

exports.createReview = async (req, res) => {
    try {
        const review = await Review.create(req.body);
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: User, attributes: ['name'] },
                { model: Product, attributes: ['name'] }
            ]
        });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getReviewById = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const [updated] = await Review.update(req.body, {
            where: { id: req.params.id }
        });
        if (!updated) {
            return res.status(404).json({ message: 'Review not found' });
        }
        const updatedReview = await Review.findByPk(req.params.id);
        res.status(200).json(updatedReview);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const deleted = await Review.destroy({
            where: { id: req.params.id }
        });
        if (!deleted) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
