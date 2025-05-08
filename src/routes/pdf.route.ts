import express from "express";
import { uploadPdf } from "../controllers/upload.pdf";
import multerPdfUpload from "../middleware/multer.config";

const router = express.Router();

// Route to upload PDF file
router.post("/upload", multerPdfUpload.single("pdf"), uploadPdf);

export default router;
