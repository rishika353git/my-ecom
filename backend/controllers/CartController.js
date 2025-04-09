const db = require("../config/db");

exports.addToCart = (req, res) => {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Please login first" });
    }

    const { product_code, name, price, original_price, quantity, color, size, image } = req.body;
    const user_id = req.user.id; // Extracted from JWT
    const subtotal = price * quantity; // Calculate subtotal

    if (!product_code || !name || !price || !quantity) {
        return res.status(400).json({ message: "All required fields must be provided." });
    }

    const query = `
        INSERT INTO cart (user_id, product_code, name, price, original_price, quantity, color, size, image, subtotal) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            quantity = quantity + VALUES(quantity), 
            subtotal = price * (quantity + VALUES(quantity))
    `;

    db.query(query, [user_id, product_code, name, price, original_price, quantity, color, size, image, subtotal], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.status(201).json({ message: "Item added to cart successfully!" });
    });
};


exports.removeFromCartById = (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    const query = "DELETE FROM cart WHERE id = ? AND user_id = ?";
    db.query(query, [id, user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Item not found in cart." });
        }
        res.status(200).json({ message: "Item removed from cart successfully!" });
    });
};


exports.getCart = (req, res) => {
    const user_id = req.user.id;

    const query = "SELECT * FROM cart WHERE user_id = ?";
    db.query(query, [user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.status(200).json({ cart: result });
    });
};


exports.updateQuantityInCart = (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const user_id = req.user.id;

    if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: "Quantity must be a positive number." });
    }

    // Update quantity and subtotal (subtotal = price * quantity)
    const query = `
        UPDATE cart 
        SET quantity = ?, subtotal = price * ? 
        WHERE id = ? AND user_id = ?`;

    db.query(query, [quantity, quantity, id, user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Item not found or unauthorized access." });
        }
        res.status(200).json({ message: "Cart item quantity updated successfully!" });
    });
};


exports.getCartSummary = (req, res) => {
    const user_id = req.user.id;

    const query = `
        SELECT 
            COUNT(*) AS total_items, 
            SUM(quantity) AS total_quantity, 
            SUM(subtotal) AS total_price 
        FROM cart 
        WHERE user_id = ?`;

    db.query(query, [user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        const summary = result[0];
        res.status(200).json({
            total_items: summary.total_items || 0,
            total_quantity: summary.total_quantity || 0,
            total_price: summary.total_price || 0,
        });
    });
};


// Get all cart data without authentication
exports.getAllCartData = (req, res) => {
    const query = "SELECT * FROM cart";

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        res.status(200).json({ all_cart_data: result });
    });
};
