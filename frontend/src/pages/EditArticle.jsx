import Header from '../components/Header'
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../api/axiosInstance";
import { Upload, Loader, CheckCircle, AlertCircle, X } from "lucide-react";
const API_IMG = import.meta.env.VITE_API_URL;
const IMAGE_BASE_URL = `${API_IMG}/articleImages/`

const EditArticlePage = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    category: "",
  });
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [errors, setErrors] = useState({});
  
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: "", message: "" });
    }, 3000);
  };

  useEffect(() => {
    const fetchArticleAndCategories = async () => {
      try {
        const [articleRes, categoriesRes] = await Promise.all([
          API.get(`/article/getArticleById/${articleId}`),
          API.get("/article/fetchCategories")
        ]);

        const article = articleRes.data;
        
        if (article.createdBy !== userData._id) {
          setError("You don't have permission to edit this article");
          return;
        }

        setFormData({
          title: article.title,
          description: article.description,
          tags: article.tags.join(", "),
          category: article.category,
        });
        setCurrentImage(IMAGE_BASE_URL + article.image);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch article data");
      } finally {
        setLoading(false);
      }
    };

    fetchArticleAndCategories();
  }, [articleId, userData._id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
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
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title should be at least 5 characters long";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Description should be at least 20 characters long";
    }
    
    
    if (!formData.category) {
      newErrors.category = "Please select a category";
    }
    
    if (formData.tags && !formData.tags.split(',').every(tag => tag.trim().length > 0)) {
      newErrors.tags = "Tags should be comma-separated, non-empty values";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast("error", "Please fix the errors before submitting");
      return;
    }
    
    setSaving(true);

    try {
      const formPayload = new FormData();
      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description);
      formPayload.append("tags", JSON.stringify(formData.tags.split(",").map(tag => tag.trim())));
      formPayload.append("category", formData.category);
      
      if (image) {
        formPayload.append("image", image);
      }

      await API.put(`/article/updateArticle/${articleId}`, formPayload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      showToast("success", "Article updated successfully!");
      
      setTimeout(() => {
        navigate("/my-articles");
      }, 1500);
    } catch (err) {
      console.log(err);
      showToast("error", "Failed to update article");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <Header/>
      
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
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
              <p className="mt-2 text-gray-600">Make changes to your article and save them when you&apos;re done.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.title ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 text-gray-900`}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="6"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.description ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 text-gray-900`}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
                  errors.image ? "border-red-300" : "border-gray-300"
                } border-dashed rounded-md`}>
                  <div className="space-y-1 text-center">
                    {imagePreview || currentImage ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview || currentImage}
                          alt="Preview"
                          className="mx-auto h-32 w-auto object-cover rounded-md"
                        />
                        {imagePreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setImage(null);
                              setImagePreview("");
                            }}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <Upload className={`mx-auto h-12 w-12 ${errors.image ? "text-red-400" : "text-gray-400"}`} />
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a new image</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                      </label>
                    </div>
                    {currentImage && !imagePreview && (
                      <p className="text-xs text-gray-500 mt-2">Current image will be kept if you don&apos;t upload a new one</p>
                    )}
                  </div>
                </div>
                {errors.image && (
                  <p className="text-sm text-red-600 mt-1">{errors.image}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.tags ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 text-gray-900`}
                  placeholder="Enter tags separated by commas"
                />
                {errors.tags && (
                  <p className="text-sm text-red-600 mt-1">{errors.tags}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
                    errors.category ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  } focus:outline-none focus:border-blue-500 rounded-md text-gray-900`}
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

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/my-articles")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditArticlePage;