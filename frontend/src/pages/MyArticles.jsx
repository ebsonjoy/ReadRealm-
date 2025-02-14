import Header from '../components/Header'
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import API from "../api/axiosInstance";
import { Trash2, Edit, Heart, ThumbsDown, Ban, Eye, PlusCircle } from "lucide-react";
const API_IMG = import.meta.env.VITE_API_URL;
const IMAGE_BASE_URL = `${API_IMG}/articleImages/`

const ArticleListPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    fetchArticles();
  }, [userData._id]);

  const fetchArticles = async () => {
    try {
      const { data } = await API.get(`/article/getUserArticles/${userData._id}`);
      setArticles(data);
      setLoading(false);
    } catch (err) {
      console.log(err)
      setError("Failed to fetch articles");
      setLoading(false);
    }
  };

  const handleDelete = async (articleId) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        await API.delete(`/article/deleteArticle/${articleId}`);
        setArticles(articles.filter(article => article._id !== articleId));
      } catch (err) {
        console.log(err)
        setError("Failed to delete article");
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Header/>
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Header/>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Articles</h1>
          <span className="text-gray-600">Total Articles: {articles.length}</span>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="space-y-6">
              <div className="text-gray-500 text-lg">You haven&apos;t created any articles yet.</div>
              <p className="text-gray-600">Share your thoughts and ideas with the community!</p>
              <button
                onClick={() => window.location.href = '/create-article'}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
              >
                <PlusCircle className="mr-2" size={20} />
                Create Your First Article
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <div
                key={article._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {article.image && (
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={IMAGE_BASE_URL + article.image}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-gray-900 line-clamp-1">
                      {article.title}
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.location.href = `/edit-user-article/${article._id}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(article._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {article.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-1" title="Likes">
                          <Heart size={16} className="text-red-500" />
                          <span>{article.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1" title="Dislikes">
                          <ThumbsDown size={16} className="text-gray-500" />
                          <span>{article.dislikes?.length || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1" title="Blocks">
                          <Ban size={16} className="text-gray-500" />
                          <span>{article.blockedBy?.length || 0}</span>
                        </div>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {formatDate(article.createdAt)}
                      </div>
                    </div>

                    <button
                      onClick={() => window.location.href = `/article/${article._id}`}
                      className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-300"
                    >
                      <Eye size={16} className="mr-2" />
                      View Article
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleListPage;