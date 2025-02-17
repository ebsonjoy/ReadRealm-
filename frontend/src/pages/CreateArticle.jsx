import Header from '../components/Header'
import { useState, useEffect } from "react";
import API from "../api/axiosInstance";
import { useSelector } from "react-redux";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";

const CreateArticlePage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const { userData } = useSelector((state) => state.user);
  
  const [errors, setErrors] = useState({});
  
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get("/article/fetchCategories");
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories", error);
        showToast("error", "Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);
  
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: "", message: "" });
    }, 3000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, image: "Image size should be less than 10MB" });
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, image: "Only JPG, PNG, and GIF files are allowed" });
        return;
      }
      
      setImage(file);
      setErrors({ ...errors, image: "" });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length < 5) {
      newErrors.title = "Title should be at least 5 characters long";
    }
    
    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.length < 20) {
      newErrors.description = "Description should be at least 20 characters long";
    }
    
    if (!image && !imagePreview) {
      newErrors.image = "Featured image is required";
    }
    
    if (!category) {
      newErrors.category = "Please select a category";
    }
    
    if (tags && !tags.split(',').every(tag => tag.trim().length > 0)) {
      newErrors.tags = "Tags should be comma-separated, non-empty values";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast("error", "Please fix the errors before submitting");
      return;
    }
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", image);
    formData.append("tags", JSON.stringify(tags.split(",").map(tag => tag.trim())));
    formData.append("category", category);
    formData.append("createdBy", userData._id);

    try {
      await API.post("/article/createArticles", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      showToast("success", "Article created successfully!");
      
      setTitle("");
      setDescription("");
      setImage("");
      setImagePreview("");
      setTags("");
      setCategory("");
      setErrors({});
    } catch (error) {
      console.error("Error creating article", error);
      showToast("error", "Failed to create article");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setErrors({ ...errors, newCategory: "Category name is required" });
      return;
    }
    
    try {
      const { data } = await API.post("/article/createCategories", { name: newCategory });
      setCategories([...categories, data.category]);
      setNewCategory("");
      setShowCategoryModal(false);
      showToast("success", "New category added successfully");
    } catch (error) {
      console.error("Error adding category", error);
      showToast("error", "Failed to add category");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg transition-opacity duration-300 ${
          toast.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle className="mr-2 h-5 w-5" />
          ) : (
            <AlertCircle className="mr-2 h-5 w-5" />
          )}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-10">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create New Article</h1>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add New Category
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.title ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  } focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900`}
                  placeholder="Enter a compelling title"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="8"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.description ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  } focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900`}
                  placeholder="Write your article content here..."
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Featured Image
                </label>
                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
                  errors.image ? "border-red-300" : "border-gray-300"
                } border-dashed rounded-lg hover:border-blue-500 transition-colors duration-200`}>
                  <div className="space-y-2 text-center">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-40 w-auto object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImage("");
                            setImagePreview("");
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className={`mx-auto h-12 w-12 ${errors.image ? "text-red-400" : "text-gray-400"}`} />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              className="sr-only"
                              onChange={handleImageChange}
                              accept="image/*"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
                {errors.image && (
                  <p className="text-sm text-red-600 mt-1">{errors.image}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.tags ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                    } focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900`}
                    placeholder="tech, news, tutorials..."
                  />
                  {errors.tags && (
                    <p className="text-sm text-red-600 mt-1">{errors.tags}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.category ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                    } focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-600 mt-1">{errors.category}</p>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full py-4 px-4 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Category</h3>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.newCategory ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              } focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900`}
              placeholder="Enter category name"
            />
            {errors.newCategory && (
              <p className="text-sm text-red-600 mt-1">{errors.newCategory}</p>
            )}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateArticlePage;