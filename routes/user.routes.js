import express from "express";
const router = express.Router();

import {
  signup,
  login,
  logout,
  verifyEmail,
  checkAuth
} from "../controllers/user.controller.js";

import {isAuthenticated} from "../middlewares/isAuthenticated.js";


router.route("/signup").post(signup);

router.route("/login").post(login);

router.route("/verify-email").post(verifyEmail);

router.route("/logout").post(logout);

router.route("/check-auth").get(isAuthenticated, checkAuth)

export default router;
