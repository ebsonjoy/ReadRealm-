import { LogOut, PlusCircle, Layout, FileText, LogIn, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { logout } from '../redux/slices/userSlice';
import API from '../api/axiosInstance';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await API.post("/auth/user-logout");
      dispatch(logout());
      localStorage.removeItem('token');
      navigate("/user-login");
      console.log('Logging out...', response);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAuthAction = () => {
    if (userData) {
      handleLogout();
    } else {
      navigate("/user-login");
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-blue-600'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center space-x-2 group"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                scrolled ? 'bg-blue-600' : 'bg-white'
              }`}>
                <Layout className={`w-5 h-5 ${
                  scrolled ? 'text-white' : 'text-blue-600'
                }`} />
              </div>
              <h1 className={`text-xl font-bold transition-colors duration-300 ${
                scrolled ? 'text-gray-800' : 'text-white'
              }`}>
                Article Feeds
              </h1>
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-md ${
                scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-blue-500'
              }`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                scrolled 
                  ? 'text-gray-600 hover:bg-gray-100 hover:text-blue-600' 
                  : 'text-blue-100 hover:bg-blue-500 hover:text-white'
              }`}
            >
              <Layout className="w-4 h-4 mr-2" />
              Dashboard
            </Link>

            {userData && (
              <>
                <Link 
                  to="/create-article" 
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    scrolled 
                      ? 'text-gray-600 hover:bg-gray-100 hover:text-blue-600' 
                      : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Article
                </Link>

                <Link 
                  to="/my-articles" 
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    scrolled 
                      ? 'text-gray-600 hover:bg-gray-100 hover:text-blue-600' 
                      : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  My Articles
                </Link>
              </>
            )}

            <Link 
              to={userData ? "/profile" : "/user-login"}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                scrolled 
                  ? 'text-gray-600 hover:bg-gray-100 hover:text-blue-600' 
                  : 'text-blue-100 hover:bg-blue-500 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              {userData ? userData.name : 'Guest'}
            </Link>

            <button
              onClick={handleAuthAction}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ml-2 transition-all duration-200 ${
                scrolled 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
            >
              {userData ? (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </button>
          </nav>
        </div>
      </div>

      <div className={`md:hidden transition-all duration-300 ${
        mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className={`px-4 pt-2 pb-4 space-y-1 ${
          scrolled ? 'bg-white' : 'bg-blue-600'
        }`}>
          <Link 
            to="/" 
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium w-full ${
              scrolled 
                ? 'text-gray-600 hover:bg-gray-100 hover:text-blue-600' 
                : 'text-blue-100 hover:bg-blue-500 hover:text-white'
            }`}
          >
            <Layout className="w-4 h-4 mr-2" />
            Dashboard
          </Link>

          {userData && (
            <>
              <Link 
                to="/create-article" 
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium w-full ${
                  scrolled 
                    ? 'text-gray-600 hover:bg-gray-100 hover:text-blue-600' 
                    : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Article
              </Link>

              <Link 
                to="/my-articles" 
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium w-full ${
                  scrolled 
                    ? 'text-gray-600 hover:bg-gray-100 hover:text-blue-600' 
                    : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                My Articles
              </Link>
            </>
          )}

          <Link 
            to={userData ? "/profile" : "/user-login"}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium w-full ${
              scrolled 
                ? 'text-gray-600 hover:bg-gray-100 hover:text-blue-600' 
                : 'text-blue-100 hover:bg-blue-500 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 mr-2" />
            {userData ? userData.name : 'Guest'}
          </Link>

          <button
            onClick={handleAuthAction}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium w-full ${
              scrolled 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            {userData ? (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;