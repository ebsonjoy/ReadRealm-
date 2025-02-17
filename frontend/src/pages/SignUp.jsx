import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axiosInstance";
import { Mail, Lock, User, Calendar, Phone, BookOpen, ChevronRight } from "lucide-react";

const Registration = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
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
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get("/article/fetchCategories");
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };
    fetchCategories();
  }, []);

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        return value.trim() === "" 
          ? "First name is required"
          : !/^[a-zA-Z\s]{2,30}$/.test(value)
          ? "First name should be 2-30 characters long and contain only letters"
          : "";
      
      case "lastName":
        return value.trim() === ""
          ? "Last name is required"
          : !/^[a-zA-Z\s]{2,30}$/.test(value)
          ? "Last name should be 2-30 characters long and contain only letters"
          : "";
      
      case "phone":
        return value.trim() === ""
          ? "Phone number is required"
          : !/^\d{10}$/.test(value.replace(/[-()\s]/g, ''))
          ? "Please enter a valid 10-digit phone number"
          : "";
      
      case "email":
        return value.trim() === ""
          ? "Email is required"
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? "Please enter a valid email address"
          : "";
      
      case "dob":
        { if (value.trim() === "") return "Date of birth is required";
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        return age < 13 ? "You must be at least 13 years old to register" : ""; }
      
      case "password":
        return value.trim() === ""
          ? "Password is required"
          : value.length < 8
          ? "Password must be at least 8 characters long"
          : !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)
          ? "Password must contain at least one uppercase letter, one lowercase letter, and one number"
          : "";
      
      case "confirmPassword":
        return value.trim() === ""
          ? "Please confirm your password"
          : value !== formData.password
          ? "Passwords do not match"
          : "";
      
      case "preferences":
        return value.length === 0 ? "Please select at least one preference" : "";
      
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    setErrors(prev => ({ ...prev, [name]: "" }));
    
    if (name === "password" && formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: value !== formData.confirmPassword ? "Passwords do not match" : ""
      }));
    }
  };

  const handleCheckboxChange = (category) => {
    const newPreferences = formData.preferences.includes(category)
      ? formData.preferences.filter((pref) => pref !== category)
      : [...formData.preferences, category];
    
    setFormData(prev => ({ ...prev, preferences: newPreferences }));
    setErrors(prev => ({ ...prev, preferences: "" }));
  };

  const validateStep = (step) => {
    const fieldsToValidate = step === 1
      ? ["firstName", "lastName", "phone", "email", "dob"]
      : ["password", "confirmPassword", "preferences"];
    
    const stepErrors = {};
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) stepErrors[field] = error;
    });
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(1)) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    setIsLoading(true);
    try {
      const response = await API.post("/auth/user-register", formData);
      console.log(response.data);
      navigate("/user-login");
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        submit: err.response?.data?.message || "Registration failed"
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (name, icon, placeholder, type = "text") => (
    <div className="space-y-1">
      <div className="relative">
        {icon}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
            errors[name] ? "border-red-500" : "border-gray-300"
          }`}
        />
      </div>
      {errors[name] && (
        <p className="text-sm text-red-600 mt-1">{errors[name]}</p>
      )}
    </div>
  );

  const renderStep1 = () => (
    <>
      <div className="flex gap-4">
        <div className="w-1/2">
          {renderField(
            "firstName",
            <User className="absolute top-3 left-3 text-gray-400" size={18} />,
            "First Name"
          )}
        </div>
        <div className="w-1/2">
          {renderField(
            "lastName",
            <User className="absolute top-3 left-3 text-gray-400" size={18} />,
            "Last Name"
          )}
        </div>
      </div>

      {renderField(
        "phone",
        <Phone className="absolute top-3 left-3 text-gray-400" size={18} />,
        "Phone Number"
      )}

      {renderField(
        "email",
        <Mail className="absolute top-3 left-3 text-gray-400" size={18} />,
        "Email Address",
        "email"
      )}

      {renderField(
        "dob",
        <Calendar className="absolute top-3 left-3 text-gray-400" size={18} />,
        "",
        "date"
      )}
    </>
  );

  const renderStep2 = () => (
    <>
      {renderField(
        "password",
        <Lock className="absolute top-3 left-3 text-gray-400" size={18} />,
        "Password",
        "password"
      )}

      {renderField(
        "confirmPassword",
        <Lock className="absolute top-3 left-3 text-gray-400" size={18} />,
        "Confirm Password",
        "password"
      )}

      <div className="space-y-3">
        <label className="text-gray-700 font-medium flex items-center gap-2">
          <BookOpen size={18} className="text-gray-400" />
          Select Your Reading Preferences:
        </label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {categories.map((category) => (
            <label
              key={category._id}
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.preferences.includes(category._id)}
                onChange={() => handleCheckboxChange(category._id)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
        {errors.preferences && (
          <p className="text-sm text-red-600 mt-1">{errors.preferences}</p>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome to ArticleFeed</h2>
            <p className="text-gray-500 mt-2">Create your account to start reading</p>
          </div>

          <div className="flex justify-between mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-900">Personal Info</p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className={`h-1 w-full ${currentStep === 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-900">Preferences</p>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {currentStep === 1 ? renderStep1() : renderStep2()}

            <div className="flex justify-between mt-6">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Back
                </button>
              )}
              {currentStep === 1 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Next Step
                  <ChevronRight size={18} className="ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>
              )}
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/user-login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;