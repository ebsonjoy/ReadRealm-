import express from "express";
const router = express.Router();
import {
  createCategory,
  createArticle,
  fetchCategories,
  fetchArticlesByUserId,
  fetchArticlesById,
  editArticle,
  userDislikeArticle,
  userLikeArticle,
  userBlockArticle,
  fetchAllArticles,
  fetchArticlesByCategory
} from "../controllers/articleController.js";
import { multerUploadArticleImages } from "../config/multer.js";

import { protect } from '../middleware/userProctect.js';

router.post("/createCategories", createCategory);
router.get("/fetchCategories",protect, fetchCategories);
router.post(
  "/createArticles",
  multerUploadArticleImages.single("image"),
  createArticle
);
router.get("/getUserArticles/:userId", fetchArticlesByUserId);
router.get("/fetchArticlesByCategory/:categoryId", fetchArticlesByCategory);
router.get("/getArticleById/:articleId", fetchArticlesById);
router.get("/fetchAllArticles", fetchAllArticles);
router.put(
  "/updateArticle/:articleId",
  multerUploadArticleImages.single("image"),
  editArticle
);
router.put("/like/:userId/:articleId", userLikeArticle);
router.put("/dislike/:userId/:articleId", userDislikeArticle);
router.put("/block/:userId/:articleId", userBlockArticle);

export default router;
