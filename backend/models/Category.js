import  mongoose from 'mongoose';
const { Schema } = mongoose;

const categorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', categorySchema);
export default Category;