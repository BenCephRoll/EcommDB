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
    <style>
      /* Inline Tailwind Styles */
      body {
        font-family: sans-serif;
        background: linear-gradient(to right, #68D391, #10B981); /* Green to Emerald gradient */
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        font-size: 24px;
        font-weight: 600;
        color: #2D3748;
        margin-bottom: 20px;
      }
      .subheading {
        font-size: 18px;
        color: #4A5568;
        margin-bottom: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      th, td {
        padding: 12px;
        border: 1px solid #E2E8F0;
        text-align: left;
      }
      th {
        background: linear-gradient(to right, #68D391, #10B981);
        color: white;
        font-weight: 600;
      }
      .total {
        font-size: 18px;
        font-weight: 600;
        color: #2D3748;
        margin-top: 20px;
      }
      .footer {
        text-align: center;
        font-size: 14px;
        color: #A0AEC0;
        margin-top: 30px;
      }
      .footer a {
        color: #10B981;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <!-- Main Container -->
    <div class="container">
      <div class="header">Bass-Technomy</div>
      <div class="subheading">Thank you for your purchase! Here are your order details:</div>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>
      <div class="total"><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</div>
      <div class="footer">
        <p>Order ID: <strong>${orderId}</strong></p>
        <p>If you have any questions, please contact <a href="mailto:support@basstechnomy.com">support@basstechnomy.com</a>.</p>
        <p>&copy; 2024 Bass-Technomy. All rights reserved.</p>
      </div>
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
