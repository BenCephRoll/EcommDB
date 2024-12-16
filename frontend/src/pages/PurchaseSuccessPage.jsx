import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import axios from "axios";
import Confetti from "react-confetti";

const PurchaseSuccessPage = () => {
	const { clearCart } = useCartStore();
	const [order, setOrder] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchOrderDetails = async (orderId) => {
			try {
				const res = await axios.get(
					`{process.env.CLIENT_URL}/api/orders/${orderId}`
				);
				setOrder(res.data);
				clearCart();
			} catch (error) {
				console.error("Error fetching order details:", error);
				setError("Failed to fetch order details.");
			}
		};

		const urlParams = new URLSearchParams(window.location.search);
		const orderId = urlParams.get("orderId");

		if (orderId) {
			fetchOrderDetails(orderId);
		} else {
			setError("No order ID found in the URL.");
		}
	}, [clearCart]);

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center px-4 text-center">
				<p className="text-red-500">{error}</p>
			</div>
		);
	}

	if (!order) {
		return (
			<div className="min-h-screen flex items-center justify-center px-4 text-center">
				<p>Loading order details...</p>
			</div>
		);
	}

	return (
		<div className="h-screen flex items-center justify-center px-4">
			<Confetti
				width={window.innerWidth}
				height={window.innerHeight}
				gravity={0.1}
				style={{ zIndex: 99 }}
				numberOfPieces={700}
				recycle={false}
			/>

			<div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10">
				<div className="p-6 sm:p-8">
					<div className="flex justify-center">
						<CheckCircle className="text-emerald-400 w-16 h-16 mb-4" />
					</div>
					<h1 className="text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2">
						Purchase Successful!
					</h1>

					<p className="text-gray-300 text-center mb-2">
						Thank you for your order. {"We're"} processing it now.
					</p>
					<p className="text-emerald-400 text-center text-sm mb-6">
						Check your email for order details and updates.
					</p>
					<div className="bg-gray-700 rounded-lg p-4 mb-6">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm text-gray-400">Order ID:</span>
							<span className="text-sm font-semibold text-emerald-400">
								{order._id}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-400">Estimated delivery</span>
							<span className="text-sm font-semibold text-emerald-400">
								3-5 business days
							</span>
						</div>
					</div>

					<div className="space-y-4">
						<button
							className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4
             rounded-lg transition duration-300 flex items-center justify-center"
						>
							<HandHeart className="mr-2" size={18} />
							Thanks for trusting us!
						</button>
						<Link
							to={"/"}
							className="w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 
            rounded-lg transition duration-300 flex items-center justify-center"
						>
							Continue Shopping
							<ArrowRight className="ml-2" size={18} />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};
export default PurchaseSuccessPage;
