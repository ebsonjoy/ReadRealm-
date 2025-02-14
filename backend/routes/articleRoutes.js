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
  fetchArticlesByCategory,
  deleteArticle
} from "../controllers/articleController.js";
import { multerUploadArticleImages } from "../config/multer.js";
import { protect } from '../middleware/userProctect.js';

router.get("/fetchAllArticles",fetchAllArticles);
router.get("/fetchCategories", fetchCategories);

router.get("/fetchArticlesByCategory/:categoryId",protect,fetchArticlesByCategory);
router.post("/createCategories",protect,createCategory);
router.post("/createArticles",protect,multerUploadArticleImages.single("image"),createArticle);
router.get("/getUserArticles/:userId",protect,fetchArticlesByUserId);
router.get("/getArticleById/:articleId",protect,fetchArticlesById);
router.put("/updateArticle/:articleId",protect,multerUploadArticleImages.single("image"),editArticle);
router.delete("/deleteArticle/:articleId",protect,deleteArticle)
router.put("/like/:userId/:articleId",protect,userLikeArticle);
router.put("/dislike/:userId/:articleId",protect,userDislikeArticle);
router.put("/block/:userId/:articleId",protect,userBlockArticle);

export default router;
