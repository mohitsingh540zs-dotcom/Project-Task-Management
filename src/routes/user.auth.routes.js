import express from "express";
import { loginValidator, registerValidator } from "../middleware/validator.js";
import { login, register } from "../controllers/user.auth.controller.js";

const authRouter = express.Router();

authRouter.post('/register', registerValidator, register);

authRouter.post('/login', loginValidator, login);

export default authRouter;
