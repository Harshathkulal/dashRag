import express, { Request, Response } from "express";
import { uploadPdf } from "../controllers/upload.pdf";
import multerPdfUpload from "../middleware/multer.config";

const router = express.Router();

// Route to upload PDF file
router.post(
  "/upload",
  multerPdfUpload.single("pdf"),
  async (req: Request, res: Response) => {
    await uploadPdf(req, res);
  }
);

export default router;
