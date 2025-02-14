import Header from '../components/Header'
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';
const API_IMG = import.meta.env.VITE_API_IMG_URL
const IMAGE_BASE_URL = `${API_IMG}/articleImages/`

const Dashboard = () => {
  console.log(API_IMG)
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, [userData?._id]);

  const fetchArticles = async () => {
    try {
      setError(null);
      let response;
      
      if (userData?._id) {
        const userResponse = await API.get(`/auth/getUser/${userData._id}`);
        const preferences = userResponse.data.preferences;
        
        if (!preferences?.length) {
          const res = await API.get('/article/fetchAllArticles');
          response = res.data;
        } else {
          const articlePromises = preferences.map(categoryId => 
            API.get(`/article/fetchArticlesByCategory/${categoryId._id}`)
              .catch(err => {
                console.error(`Error fetching category ${categoryId}:`, err);
                return { data: [] };
              })
          );
          
          const results = await Promise.all(articlePromises);
          const allArticles = results.flatMap(result => result.data);
          response = [...new Map(allArticles.map(item => [item._id, item])).values()];
        }
      } else {
        const res = await API.get('/article/fetchAllArticles');
        response = res.data;
      }
      
      // Filter out blocked articles if user is logged in
      if (userData?._id) {
        response = response.filter(article => !article.blockedBy?.includes(userData._id));
      }
      
      setArticles(response);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Failed to load articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionType, articleId) => {
    if (!userData?._id) {
      navigate('/user-login');
      return;
    }

    try {
      await API.put(`/article/${actionType}/${userData._id}/${articleId}`);
      
      if (actionType === 'block') {
        // Remove the blocked article from the display
        setArticles(prevArticles => prevArticles.filter(article => article._id !== articleId));
        // Close the modal if the blocked article was being viewed
        if (selectedArticle?._id === articleId) {
          setSelectedArticle(null);
        }
      } else {
        setArticles(prevArticles => 
          prevArticles.map(article => {
            if (article._id !== articleId) return article;
            
            const updatedArticle = { ...article };
            const userId = userData._id;
            
            switch(actionType) {
              case 'like':
                if (!updatedArticle.likes?.includes(userId)) {
                  updatedArticle.likes = [...(updatedArticle.likes || []), userId];
                  updatedArticle.dislikes = updatedArticle.dislikes?.filter(id => id !== userId) || [];
                }
                break;
              case 'dislike':
                if (!updatedArticle.dislikes?.includes(userId)) {
                  updatedArticle.dislikes = [...(updatedArticle.dislikes || []), userId];
                  updatedArticle.likes = updatedArticle.likes?.filter(id => id !== userId) || [];
                }
                break;
              default:
                break;
            }
            
            return updatedArticle;
          })
        );
        
        if (selectedArticle?._id === articleId) {
          setSelectedArticle(articles.find(article => article._id === articleId));
        }
      }
    } catch (error) {
      console.error(`Error ${actionType}ing article:`, error);
      setError(`Failed to ${actionType} article. Please try again.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              {userData?._id ? 'Your Personalized Feed' : 'Discover Articles'}
            </h1>
            {userData?._id && (
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Customize Feed
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <div 
                  key={article._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                >
                  {article.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={IMAGE_BASE_URL + article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2 hover:text-blue-600 cursor-pointer">
                      {article.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {article.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex space-x-6">
                        <button
                          onClick={() => handleAction('like', article._id)}
                          className={`flex items-center space-x-2 ${
                            article.likes?.includes(userData?._id)
                              ? 'text-blue-600'
                              : 'text-gray-500 hover:text-blue-600'
                          } transition-colors`}
                        >
                          <span className="text-xl">👍</span>
                          <span className="text-sm font-medium">{article.likes?.length || 0}</span>
                        </button>
                        <button
                          onClick={() => handleAction('dislike', article._id)}
                          className={`flex items-center space-x-2 ${
                            article.dislikes?.includes(userData?._id)
                              ? 'text-red-600'
                              : 'text-gray-500 hover:text-red-600'
                          } transition-colors`}
                        >
                          <span className="text-xl">👎</span>
                          <span className="text-sm font-medium">{article.dislikes?.length || 0}</span>
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleAction('block', article._id)}
                        className={`text-sm px-3 py-1 rounded-full transition-colors ${
                          article.blockedBy?.includes(userData?._id)
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        {article.blockedBy?.includes(userData?._id) ? 'Blocked' : 'Block'}
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Read More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {selectedArticle && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">{selectedArticle.title}</h2>
                    <button 
                      onClick={() => setSelectedArticle(null)}
                      className="text-gray-400 hover:text-gray-600 p-2"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {selectedArticle.image && (
                    <div className="relative h-80 mb-6 rounded-lg overflow-hidden">
                      <img 
                        src={IMAGE_BASE_URL + selectedArticle.image}
                        alt={selectedArticle.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    {selectedArticle.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div className="flex space-x-6">
                      <button
                        onClick={() => handleAction('like', selectedArticle._id)}
                        className={`flex items-center space-x-2 ${
                          selectedArticle.likes?.includes(userData?._id)
                            ? 'text-blue-600'
                            : 'text-gray-500 hover:text-blue-600'
                        } transition-colors`}
                      >
                        <span className="text-xl">👍</span>
                        <span className="text-sm font-medium">
                          {selectedArticle.likes?.length || 0}
                        </span>
                      </button>
                      <button
                        onClick={() => handleAction('dislike', selectedArticle._id)}
                        className={`flex items-center space-x-2 ${
                          selectedArticle.dislikes?.includes(userData?._id)
                            ? 'text-red-600'
                            : 'text-gray-500 hover:text-red-600'
                        } transition-colors`}
                      >
                        <span className="text-xl">👎</span>
                        <span className="text-sm font-medium">
                          {selectedArticle.dislikes?.length || 0}
                        </span>
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleAction('block', selectedArticle._id)}
                      className={`text-sm px-4 py-2 rounded-full transition-colors ${
                        selectedArticle.blockedBy?.includes(userData?._id)
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      {selectedArticle.blockedBy?.includes(userData?._id) ? 'Blocked' : 'Block'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;