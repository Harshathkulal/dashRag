import multer from "multer";

// File storage method
const storage = multer.memoryStorage();

// File type filter method
const fileFilter = (req: any, file: Express.Multer.File, cb: Function) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
};

// Multer upload configuration
const multerPdfUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // file size Limit (10 MB)
  fileFilter,
});

export default multerPdfUpload;
