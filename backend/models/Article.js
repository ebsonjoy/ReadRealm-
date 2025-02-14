import  mongoose from 'mongoose';
const { Schema } = mongoose;

const articleSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    tags: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Article = mongoose.model('Article', articleSchema);
export default Article;