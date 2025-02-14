import { useState,useEffect } from "react";
import { useNavigate,Link } from "react-router-dom";
import API from "../api/axiosInstance";
import { Mail, Lock, User, Calendar, Phone } from "lucide-react";

const Registration = () => {
  const navigate = useNavigate();
  const[categories,setCategories] = useState([])
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dob: "",
    password: "",
    confirmPassword: "",
    preferences: [],
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get("/article/fetchCategories");
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (category) => {
    setFormData((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(category)
        ? prev.preferences.filter((pref) => pref !== category)
        : [...prev.preferences, category],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await API.post("/auth/user-register", formData);
      console.log(response.data);
      navigate("/user-login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500 mt-2">Sign up to explore articles</p>
          </div>

          {/* Error Message */}
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-center">{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <div className="relative w-1/2">
                <User className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-black placeholder-gray-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="relative w-1/2">
                <User className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-black placeholder-gray-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <Phone className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-black placeholder-gray-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute top-3 left-3 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-black placeholder-gray-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="relative">
              <Calendar className="absolute top-3 left-3 text-gray-400" />
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-black placeholder-gray-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute top-3 left-3 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-black placeholder-gray-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute top-3 left-3 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-black placeholder-gray-500 focus:ring-blue-500"
                required
              />
            </div>

            {/* Preferences */}
            <div>
              <label className="text-gray-700 font-medium">Select Preferences:</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {categories.map((category) => (
                  <label key={category._id} className="flex items-center text-black placeholder-gray-500 gap-2">
                    <input
                      type="checkbox"
                      checked={formData.preferences.includes(category._id)}
                      onChange={() => handleCheckboxChange(category._id)}
                      className="h-4 w-4"
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 border rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>

            <div className="text-center mt-3">
              <p className="text-sm">
                Already have an account?{" "}
               <Link to="/user-login" className="text-blue-600 hover:text-blue-500">
                  Login
                  </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;
