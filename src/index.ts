import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import pdfRouter from "./routes/pdf.route";

dotenv.config();
const app = express();
app.use(helmet());
app.use(express.json());

app.use("/api/pdf", pdfRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
