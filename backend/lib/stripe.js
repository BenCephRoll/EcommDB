import paystack from "paystack-api";
import dotenv from "dotenv";

dotenv.config();

export const paystackClient = paystack(process.env.PAYSTACK_SECRET_KEY);
