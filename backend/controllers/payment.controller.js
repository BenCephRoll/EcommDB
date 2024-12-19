import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import paystack from "paystack-api";
import { sendOrderEmail } from "../lib/emailService.js"; // Import the sendOrderEmail function

const paystackClient = paystack(process.env.PAYSTACK_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let totalAmount = 0;

		const lineItems = products.map((product) => {
			const amount = Math.round(product.price * 100); // Paystack expects amount in kobo (smallest currency unit)
			totalAmount += amount * product.quantity;

			return {
				name: product.name,
				amount: amount,
				quantity: product.quantity || 1,
			};
		});

		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({
				code: couponCode,
				userId: req.user._id,
				isActive: true,
			});
			if (coupon) {
				totalAmount -= Math.round(
					(totalAmount * coupon.discountPercentage) / 100
				);
			}
		}

		const transaction = await paystackClient.transaction.initialize({
			email: req.user.email,
			amount: totalAmount,
			callback_url: `${process.env.SERVER_URL}/api/payments/checkout-success`, // Update to server URL
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});

		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}
		res.status(200).json({
			authorization_url: transaction.data.authorization_url,
			totalAmount: totalAmount / 100,
		});
	} catch (error) {
		console.error("Error processing checkout:", error);
		res
			.status(500)
			.json({ message: "Error processing checkout", error: error.message });
	}
};

export const checkoutSuccess = async (req, res) => {
	try {
		const { reference } = req.query;
		const transaction = await paystackClient.transaction.verify({ reference });

		if (transaction.data.status === "success") {
			if (transaction.data.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{
						code: transaction.data.metadata.couponCode,
						userId: transaction.data.metadata.userId,
					},
					{
						isActive: false,
					}
				);
			}

			// Create a new Order
			const products = JSON.parse(transaction.data.metadata.products);
			const newOrder = new Order({
				user: transaction.data.metadata.userId,
				products: products.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price,
				})),
				totalAmount: transaction.data.amount / 100, // Convert from kobo to naira
				paystackReference: reference,
			});

			await newOrder.save();
			console.error(transaction.data.metadata)

			    // Assuming the userId is passed via metadata in the transaction
    const userId = transaction.data.metadata.userId;

    // Find the user by ID in the database
    const userfind = await User.findById(userId);

    if (!userfind) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Retrieve the user's email
    const userEmailForSending = userfind.email;

			  // Send order confirmation emails to both the user and admin
    await sendOrderEmail({
      userEmail: userEmailForSending,
      orderId: newOrder._id,
      products: products,
      totalAmount: transaction.data.amount / 100,
    });

    // Send email to admin (you can specify the admin email here)
    await sendOrderEmail({
      userEmail: process.env.ADMIN_EMAIL, // Add admin email in .env
      orderId: newOrder._id,
      products: products,
      totalAmount: transaction.data.amount / 100,
    });

			// Redirect to the success page with the order ID
			res.redirect(
				`${process.env.CLIENT_URL}/purchase-success?orderId=${newOrder._id}`
			);
		}
	} catch (error) {
		console.error("Error processing successful checkout:", error);
		res.status(500).json({
			message: "Error processing successful checkout",
			error: error.message,
		});
	}
};

async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
}
