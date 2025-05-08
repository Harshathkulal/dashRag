import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";

dotenv.config();
const app = express();
app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, dashRage!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
