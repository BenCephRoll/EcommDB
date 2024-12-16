import express from "express";
import { checkOrder } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/:orderId", checkOrder);

export default router;
