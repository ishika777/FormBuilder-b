import express from "express";
const router = express.Router();

import {createForm, deleteForm, updateForm} from "../controllers/form.controller.js"

import {isAuthenticated} from "../middlewares/isAuthenticated.js" 
import upload from "../middlewares/multer.js"

router.route("/").post(isAuthenticated, createForm);
router.route("/:formId").delete(isAuthenticated, deleteForm);
router.route("/:formId").put(isAuthenticated, upload.any(), updateForm);






export default router;
