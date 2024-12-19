import { MailtrapClient } from "@mailtrap/sdk";
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
          <td class="border px-4 py-2">$${product.price.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  return `
    <html>
      <head>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-100 font-sans leading-normal tracking-normal">
        <div class="max-w-4xl mx-auto bg-white p-5 rounded-md shadow-md mt-10">
          <h2 class="text-2xl font-bold text-gray-700 mb-4">Order Confirmation</h2>
          <p class="text-gray-600 mb-4">Thank you for your purchase! Here are your order details:</p>
          <table class="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr class="bg-gray-200">
                <th class="border px-4 py-2">Product</th>
                <th class="border px-4 py-2">Quantity</th>
                <th class="border px-4 py-2">Price</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
            </tbody>
          </table>
          <p class="text-gray-700 mt-4"><strong>Total Amount:</strong> $${totalAmount.toFixed(
            2
          )}</p>
          <p class="text-gray-600 mt-4">Order ID: <strong>${orderId}</strong></p>
          <p class="text-gray-600 mt-4">If you have any questions, please contact support.</p>
        </div>
      </body>
    </html>
  `;
};

export const sendOrderEmail = async (order) => {
  const htmlContent = generateHtml(order);

  const emailData = {
    from: {
      email: SENDER_EMAIL,
      name: "Your Shop",
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
