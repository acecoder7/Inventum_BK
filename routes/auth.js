import express from "express";
import {
  register,
  login,
  logout,
  whoami,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.js";
import { isAuthenticated } from "../utils/Auth.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/whoami", whoami);

router.get("/logout", logout);

router.post("/forgot/password", forgotPassword);

router.put("/password/reset/:token", resetPassword);

export default router;