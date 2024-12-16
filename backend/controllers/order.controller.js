import Order from "../models/order.model.js";

// Function to check and retrieve order details
export const checkOrder = async (req, res) => {
	try {
		const { orderId } = req.params; // Assuming orderId is passed as a query parameter

		if (!orderId) {
			return res.status(400).json({ message: "Order ID is required" });
		}

		// Find the order by ID
		const order = await Order.findById(orderId).populate("products.product");

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		// Return the order details
		res.status(200).json(order);
	} catch (error) {
		console.error("Error retrieving order:", error);
		res
			.status(500)
			.json({ message: "Error retrieving order", error: error.message });
	}
};
