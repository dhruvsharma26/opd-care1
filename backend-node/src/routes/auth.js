import express from "express";
import * as authController from "../controllers/auth.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Authentication endpoints",
    endpoints: {
      signup: "/api/auth/signup",
      login: "/api/auth/login",
    },
  });
});

router.post("/signup", authController.signup);
router.post("/login", authController.login);

export default router;
