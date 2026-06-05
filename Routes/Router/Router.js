import express from "express";
import userapi from "../User/userapi.js";
import transaction from "../Transaction/transaction.js";
const router = express.Router();

router.use("/", userapi);
router.use("/", transaction);

export default router;
