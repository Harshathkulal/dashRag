import express from "express";
import { ChatWithPdf } from "../controllers/chat";

const router = express.Router();

router.post("/chat", ChatWithPdf);

export default router;