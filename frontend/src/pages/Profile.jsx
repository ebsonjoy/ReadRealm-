import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import API from "../api/axiosInstance";
import { User, Mail, Phone, Calendar, Lock, Settings, Shield, Save, AlertTriangle } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('personal');
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        dob: '',
        preferences: []
    });

    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        dob: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const { userData } = useSelector((state) => state.user);
    const userId = userData._id;

    useEffect(() => {
        fetchUserAndCategories();
    }, []);

    const fetchUserAndCategories = async () => {
        try {
            const userResponse = await API.get(`/auth/getUser/${userId}`);
            const userDetails = userResponse.data;
            
            if (userDetails.dob) {
                userDetails.dob = new Date(userDetails.dob).toISOString().split('T')[0];
            }
            setUser(userDetails);

            const categoriesResponse = await API.get('/article/fetchCategories');
            setCategories(categoriesResponse.data);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Error fetching data'
            });
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'firstName':
            case 'lastName':
                if (!value.trim()) {
                    error = `${name === 'firstName' ? 'First' : 'Last'} name is required`;
                } else if (value.trim().length < 2) {
                    error = `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    error = 'Only alphabets are allowed';
                }
                break;
            case 'email':
                if (!value) {
                    error = 'Email is required';
                } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
                    error = 'Invalid email address format';
                }
                break;
            case 'phone':
                if (!value) {
                    error = 'Phone number is required';
                } else if (!/^[0-9]{10}$/.test(value.replace(/\D/g, ''))) {
                    error = 'Phone must be a valid 10-digit number';
                }
                break;
            case 'dob':
                if (!value) {
                    error = 'Date of birth is required';
                } else {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    
                    let age = today.getFullYear() - selectedDate.getFullYear();
                    const monthDiff = today.getMonth() - selectedDate.getMonth();
                    
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
                        age--;
                    }
                    
                    if (age < 13) {
                        error = 'You must be at least 13 years old';
                    } else if (selectedDate > today) {
                        error = 'Invalid date: Cannot select future date';
                    }
                }
                break;
            case 'oldPassword':
                if (!value && (passwords.newPassword || passwords.confirmPassword)) {
                    error = 'Current password is required';
                }
                break;
            case 'newPassword':
                if (value) {
                    if (value.length < 8) {
                        error = 'Password must be at least 8 characters long';
                    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                        error = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
                    }
                }
                break;
            case 'confirmPassword':
                if (passwords.newPassword && value !== passwords.newPassword) {
                    error = 'Passwords do not match';
                }
                break;
            default:
                break;
        }

        return error;
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        
        setUser(prev => ({
            ...prev,
            [name]: value
        }));
        
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handlePreferencesChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setUser(prev => ({
            ...prev,
            preferences: selectedOptions
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        
        setPasswords(prev => ({
            ...prev,
            [name]: value
        }));
        
        const error = validateField(name, value);
        
        if (name === 'newPassword') {
            const confirmError = validateField('confirmPassword', passwords.confirmPassword);
            setErrors(prev => ({
                ...prev,
                [name]: error,
                confirmPassword: confirmError
            }));
        } else {
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    };

    const validateForm = (form) => {
        let isValid = true;
        const newErrors = { ...errors };
        
        if (form === 'profile') {
            for (const field of ['firstName', 'lastName', 'email', 'phone', 'dob']) {
                const error = validateField(field, user[field]);
                newErrors[field] = error;
                if (error) isValid = false;
            }
        } else if (form === 'password') {
            if (passwords.oldPassword || passwords.newPassword || passwords.confirmPassword) {
                for (const field of ['oldPassword', 'newPassword', 'confirmPassword']) {
                    const error = validateField(field, passwords[field]);
                    newErrors[field] = error;
                    if (error) isValid = false;
                }
            }
        }
        
        setErrors(newErrors);
        return isValid;
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        
        if (!validateForm('profile')) {
            setMessage({ type: 'error', text: 'Please fix validation errors before submitting' });
            return;
        }
        
        setLoading(true);
        try {
            const response = await API.put('/auth/profile', user);
            setMessage({ type: 'success', text: response.data.message });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Profile update failed'
            });
        }
        setLoading(false);
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        if (!validateForm('password')) {
            setMessage({ type: 'error', text: 'Please fix validation errors before submitting' });
            return;
        }
        
        setLoading(true);
        try {
            const response = await API.put('/auth/change-password', {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            setMessage({ type: 'success', text: response.data.message });
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setErrors(prev => ({
                ...prev,
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Password change failed'
            });
        }
        setLoading(false);
    };

    const renderFieldError = (fieldName) => {
        if (errors[fieldName]) {
            return (
                <div className="mt-1 text-red-600 text-sm flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span>{errors[fieldName]}</span>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            
            <div className="max-w-6xl mx-auto px-4 py-8 mt-16">
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg ${
                        message.type === 'error' ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : 
                        'bg-green-50 text-green-700 border-l-4 border-green-500'
                    }`}>
                        <p className="font-medium">{message.text}</p>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex flex-col items-center">
                                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-4xl text-white font-bold">
                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                    </span>
                                </div>
                                <h2 className="mt-4 text-xl font-bold text-gray-800">
                                    {user.firstName} {user.lastName}
                                </h2>
                                <p className="text-gray-500">{user.email}</p>
                            </div>

                            <div className="mt-8 space-y-2">
                                <button
                                    onClick={() => setActiveSection('personal')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                        activeSection === 'personal' 
                                            ? 'bg-blue-50 text-blue-600' 
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <User size={20} />
                                    <span>Personal Info</span>
                                </button>

                                <button
                                    onClick={() => setActiveSection('preferences')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                        activeSection === 'preferences' 
                                            ? 'bg-blue-50 text-blue-600' 
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <Settings size={20} />
                                    <span>Preferences</span>
                                </button>

                                <button
                                    onClick={() => setActiveSection('security')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                        activeSection === 'security' 
                                            ? 'bg-blue-50 text-blue-600' 
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <Shield size={20} />
                                    <span>Security</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            {activeSection === 'personal' && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h3>
                                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                                <div className="relative rounded-lg shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <User className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        value={user.firstName}
                                                        onChange={handleProfileChange}
                                                        className={`block w-full pl-10 pr-4 py-2.5 border ${errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:border-transparent text-gray-800`}
                                                        required
                                                    />
                                                </div>
                                                {renderFieldError('firstName')}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                                <div className="relative rounded-lg shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <User className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        value={user.lastName}
                                                        onChange={handleProfileChange}
                                                        className={`block w-full pl-10 pr-4 py-2.5 border ${errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:border-transparent text-gray-800`}
                                                        required
                                                    />
                                                </div>
                                                {renderFieldError('lastName')}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                                <div className="relative rounded-lg shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Mail className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={user.email}
                                                        onChange={handleProfileChange}
                                                        className={`block w-full pl-10 pr-4 py-2.5 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:border-transparent text-gray-800`}
                                                        required
                                                    />
                                                </div>
                                                {renderFieldError('email')}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                                <div className="relative rounded-lg shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Phone className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={user.phone}
                                                        onChange={handleProfileChange}
                                                        className={`block w-full pl-10 pr-4 py-2.5 border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:border-transparent text-gray-800`}
                                                        required
                                                    />
                                                </div>
                                                {renderFieldError('phone')}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                                <div className="relative rounded-lg shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Calendar className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="date"
                                                        name="dob"
                                                        value={user.dob}
                                                        onChange={handleProfileChange}
                                                        className={`block w-full pl-10 pr-4 py-2.5 border ${errors.dob ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:border-transparent text-gray-800`}
                                                        required
                                                    />
                                                </div>
                                                {renderFieldError('dob')}
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                                            >
                                                <Save className="h-5 w-5 mr-2" />
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeSection === 'preferences' && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-6">Your Preferences</h3>
                                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Your Interests
                                            </label>
                                            <select
                                                multiple
                                                value={user.preferences.map(pref => typeof pref === 'object' ? pref._id : pref)}
                                                onChange={handlePreferencesChange}
                                                className="block w-full p-2.5 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                size="6"
                                            >
                                                {categories.map((category) => (
                                                    <option key={category._id} value={category._id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                                            >
                                                <Save className="h-5 w-5 mr-2" />
                                                {loading ? 'Saving...' : 'Save Preferences'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeSection === 'security' && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-6">Security Settings</h3>
                                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                                <div className="relative rounded-lg shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Lock className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="password"
                                                        name="oldPassword"
                                                        value={passwords.oldPassword}
                                                        onChange={handlePasswordChange}
                                                        className={`block w-full pl-10 pr-4 py-2.5 border ${errors.oldPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:border-transparent text-gray-800`}
                                                        required={!!passwords.newPassword || !!passwords.confirmPassword}
                                                    />
                                                </div>
                                                {renderFieldError('oldPassword')}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                                <div className="relative rounded-lg shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Lock className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="password"
                                                        name="newPassword"
                                                        value={passwords.newPassword}
                                                        onChange={handlePasswordChange}
                                                        className={`block w-full pl-10 pr-4 py-2.5 border ${errors.newPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:border-transparent text-gray-800`}
                                                        required={!!passwords.oldPassword || !!passwords.confirmPassword}
                                                    />
                                                </div>
                                                {renderFieldError('newPassword')}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                                <div className="relative rounded-lg shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Lock className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={passwords.confirmPassword}
                                                        onChange={handlePasswordChange}
                                                        className={`block w-full pl-10 pr-4 py-2.5 border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg focus:border-transparent text-gray-800`}
                                                        required={!!passwords.oldPassword || !!passwords.newPassword}
                                                    />
                                                </div>
                                                {renderFieldError('confirmPassword')}
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="inline-flex items-center px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors duration-200"
                                            >
                                                <Shield className="h-5 w-5 mr-2" />
                                                {loading ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;