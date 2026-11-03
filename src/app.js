import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/user.auth.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.use('/api/v1/auth', authRouter);

app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
