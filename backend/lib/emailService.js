import { MailtrapClient } from "mailtrap"
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const mailtrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});

const SENDER_EMAIL = process.env.SENDER_EMAIL;

const generateHtml = (order) => {
  const { orderId, products, totalAmount } = order;

  const productRows = products
    .map(
      (product) =>
        `<tr>
          <td class="border px-4 py-2">${product.name}</td>
          <td class="border px-4 py-2">${product.quantity}</td>
          <td class="border px-4 py-2">NGN${product.price.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  return `
<html>
  <head>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.0.24/dist/tailwind.min.css" rel="stylesheet">
  </head>
  <body class="bg-gradient-to-r from-green-400 to-emerald-500 font-sans leading-normal tracking-normal">
    
    <!-- Navbar -->
    <nav class="bg-blue-600 text-white py-4 shadow-md">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        <div class="text-2xl font-bold">Bass-Technomy</div>
        <div class="space-x-6">
          <a href="#" class="hover:text-blue-300">Home</a>
          <a href="#" class="hover:text-blue-300">About</a>
          <a href="#" class="hover:text-blue-300">Services</a>
          <a href="#" class="hover:text-blue-300">Contact</a>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-xl mt-16 mb-8">
      <h2 class="text-3xl font-semibold text-gray-800 mb-6">Order Confirmation</h2>
      <p class="text-lg text-gray-600 mb-6">Thank you for your purchase! Here are your order details:</p>
      <table class="min-w-full table-auto border-collapse text-gray-600 mb-6">
        <thead>
          <tr class="bg-gradient-to-r from-green-300 to-emerald-300">
            <th class="border px-6 py-3 text-left font-medium">Product</th>
            <th class="border px-6 py-3 text-left font-medium">Quantity</th>
            <th class="border px-6 py-3 text-left font-medium">Price</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>
      <p class="text-lg text-gray-800 mt-6"><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
      <p class="text-sm text-gray-500 mt-4">Order ID: <strong>${orderId}</strong></p>
      <p class="text-sm text-gray-500 mt-4">If you have any questions, please contact support.</p>
    </div>

    <!-- Footer -->
    <footer class="bg-blue-600 text-white py-4">
      <div class="max-w-6xl mx-auto text-center">
        <p>&copy; 2024 Bass-Technomy. All rights reserved.</p>
      </div>
    </footer>

  </body>
</html>
  `;
};

export const sendOrderEmail = async (order) => {
  const htmlContent = generateHtml(order);

  const emailData = {
    from: {
      email: SENDER_EMAIL,
      name: "Bass techonomy",
    },
    to: [
      {
        email: order.userEmail,
        name: "Customer",
      },
    ],
    subject: `Order Confirmation - Order #${order.orderId}`,
    html: htmlContent,
  };

  try {
    await mailtrapClient.send(emailData);
    console.log("Order confirmation email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Failed to send email");
  }
};
