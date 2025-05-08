import { Request, Response } from "express";

export const uploadPdf = async (
  req: Request & { file?: Express.Multer.File },
  res: Response
): Promise<void> => {
  // Check if file was uploaded
  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  // If file is uploaded, send success response with file details
  res.status(200).json({
    message: "File uploaded successfully",
    file: req.file,
  });
};
