import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import Article from "../models/Article.js";
import mongoose from 'mongoose';


const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    try {
        const existingCategory = await Category.findOne({ name });

        if (existingCategory) {
            return res.status(400).json({ message: `${name} already exists` });
        }

        const category = await Category.create({ name });
        res.status(201).json({ message: `${category.name} is successfully created`, category });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

const editCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { name } = req.body;

    try {
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        category.name = name;
        category.updatedAt = Date.now();
        await category.save();

        res.status(200).json({ message: "Category updated successfully", category });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

const fetchCategories = asyncHandler(async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


// ARTICLE
const createArticle = asyncHandler(async (req, res) => {
    const { title, description, tags, category, createdBy } = req.body;
    const parsedTags = JSON.parse(tags);
    const articleImage = req.file.filename
    try {

        const article = new Article({
            title,
            description,
            image:articleImage,
            tags:parsedTags,
            category,
            createdBy,
        });
        await article.save();
        res.status(201).json({ message: "Article created successfully", article });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


const editArticle = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    const { title, description, tags, category } = req.body;
    try {
        const article = await Article.findById(articleId);

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }
        let imageUrl = article.image;

        if (req.file) {
            imageUrl = req.file.filename;
        }
        article.title = title || article.title;
        article.description = description || article.description;
        article.image = imageUrl;
        article.tags = tags ? JSON.parse(tags) : article.tags;
        article.category = category || article.category;
        article.updatedAt = Date.now();
        await article.save();

        res.status(200).json({ message: "Article updated successfully", article });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


const fetchAllArticles = asyncHandler(async (req, res) => {
    try {
        const articles = await Article.find().populate("category").populate("createdBy", "name").sort({ createdAt: -1 });
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

const fetchArticlesByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    try {
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const articles = await Article.find({ createdBy: userId });
        res.status(200).json(articles);
    } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ message: "Server error" });
    }
});

const fetchArticlesById = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    try {
        if (!articleId) {
            return res.status(400).json({ message: "Article ID is required" });
        }

        const articles = await Article.findById(articleId);
        if (!articles) {
            return res.status(404).json({ message: "No articles found" });
        }

        res.status(200).json(articles);
    } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ message: "Server error" });
    }
});



const fetchArticlesByCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    try {
        const articles = await Article.find({ category: categoryId }).populate("category").populate("createdBy", "name").sort({ createdAt: -1 });

        if (articles.length === 0) {
            return res.status(404).json({ message: "No articles found for this category" });
        }

        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

const userLikeArticle = asyncHandler(async (req, res) => {
    const { userId, articleId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(articleId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid article or user ID format' });
    }

    const article = await Article.findById(articleId);
    if (!article) {
        return res.status(404).json({ message: 'Article not found' });
    }

    try {
        // Initialize arrays if they don't exist
        if (!article.likes) article.likes = [];
        if (!article.dislikes) article.dislikes = [];

        // Remove from dislikes if present
        const dislikeIndex = article.dislikes.indexOf(userId);
        if (dislikeIndex !== -1) {
            article.dislikes.splice(dislikeIndex, 1);
        }

        // Toggle like
        const likeIndex = article.likes.indexOf(userId);
        if (likeIndex !== -1) {
            // Unlike if already liked
            article.likes.splice(likeIndex, 1);
        } else {
            // Add like if not already liked
            article.likes.push(userId);
        }

        const updatedArticle = await article.save();
        
        res.status(200).json({ 
            message: likeIndex !== -1 ? 'Article unliked successfully' : 'Article liked successfully',
            article: updatedArticle 
        });
    } catch (error) {
        console.error('Error in userLikeArticle:', error);
        res.status(500).json({ 
            message: 'Error updating like status',
            error: error.message 
        });
    }
});

const userDislikeArticle = asyncHandler(async (req, res) => {
    const { userId, articleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(articleId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid article or user ID format' });
    }

    const article = await Article.findById(articleId);
    if (!article) {
        return res.status(404).json({ message: 'Article not found' });
    }

    try {
        if (!article.likes) article.likes = [];
        if (!article.dislikes) article.dislikes = [];

        const likeIndex = article.likes.indexOf(userId);
        if (likeIndex !== -1) {
            article.likes.splice(likeIndex, 1);
        }

        const dislikeIndex = article.dislikes.indexOf(userId);
        if (dislikeIndex !== -1) {
            article.dislikes.splice(dislikeIndex, 1);
        } else {
            article.dislikes.push(userId);
        }

        const updatedArticle = await article.save();
        
        res.status(200).json({ 
            message: dislikeIndex !== -1 ? 'Article undisliked successfully' : 'Article disliked successfully',
            article: updatedArticle 
        });
    } catch (error) {
        console.error('Error in userDislikeArticle:', error);
        res.status(500).json({ 
            message: 'Error updating dislike status',
            error: error.message 
        });
    }
});

const userBlockArticle = asyncHandler(async (req, res) => {
    const { userId, articleId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(articleId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid article or user ID format' });
    }

    const article = await Article.findById(articleId);
    if (!article) {
        return res.status(404).json({ message: 'Article not found' });
    }

    try {
        // Initialize array if it doesn't exist
        if (!article.blockedBy) article.blockedBy = [];

        // Toggle block status
        const blockIndex = article.blockedBy.indexOf(userId);
        if (blockIndex !== -1) {
            // Unblock if already blocked
            article.blockedBy.splice(blockIndex, 1);
        } else {
            // Block if not already blocked
            article.blockedBy.push(userId);
        }

        const updatedArticle = await article.save();
        
        res.status(200).json({ 
            message: blockIndex !== -1 ? 'Article unblocked successfully' : 'Article blocked successfully',
            article: updatedArticle 
        });
    } catch (error) {
        console.error('Error in userBlockArticle:', error);
        res.status(500).json({ 
            message: 'Error updating block status',
            error: error.message 
        });
    }
});

// Don't forget to import mongoose at the top of your file

export {
    createCategory,
    editCategory,
    fetchCategories,
    createArticle,
    editArticle,
    fetchAllArticles,
    fetchArticlesByCategory,
    fetchArticlesByUserId,
    fetchArticlesById,
    userLikeArticle, 
    userDislikeArticle, 
    userBlockArticle
};
