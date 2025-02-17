// import { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import Header from '../components/Header';
// import API from '../api/axiosInstance';

// const Preferences = () => {
//   const [categories, setCategories] = useState([]);
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);
//   const [successMessage, setSuccessMessage] = useState('');
//   const { userData } = useSelector((state) => state.user);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!userData?._id) {
//       navigate('/user-login');
//       return;
//     }
//     fetchData();
//   }, [userData, navigate]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Fetch all available categories
//       const categoriesResponse = await API.get('/category/getAllCategories');
//       setCategories(categoriesResponse.data);

//       // Fetch user's current preferences
//       const userResponse = await API.get(`/auth/getUser/${userData._id}`);
//       const userPreferences = userResponse.data.preferences || [];
//       setSelectedCategories(userPreferences.map(pref => pref._id));
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setError('Failed to load preferences. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCategoryToggle = (categoryId) => {
//     setSelectedCategories(prev => {
//       if (prev.includes(categoryId)) {
//         return prev.filter(id => id !== categoryId);
//       } else {
//         return [...prev, categoryId];
//       }
//     });
//   };

//   const handleSavePreferences = async () => {
//     try {
//       setSaving(true);
//       setError(null);
//       setSuccessMessage('');

//       await API.put(`/auth/updatePreferences/${userData._id}`, {
//         preferences: selectedCategories
//       });

//       setSuccessMessage('Preferences saved successfully!');
//       setTimeout(() => {
//         navigate('/dashboard');
//       }, 1500);
//     } catch (error) {
//       console.error('Error saving preferences:', error);
//       setError('Failed to save preferences. Please try again.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Header />
//         <div className="container mx-auto px-4 pt-24">
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />
      
//       <main className="container mx-auto px-4 pt-24 pb-12">
//         <div className="max-w-3xl mx-auto">
//           <div className="bg-white rounded-xl shadow-sm p-6">
//             <h1 className="text-3xl font-bold text-gray-800 mb-6">Customize Your Feed</h1>
            
//             {error && (
//               <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
//                 <div className="flex">
//                   <div className="flex-shrink-0">
//                     <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <div className="ml-3">
//                     <p className="text-sm text-red-700">{error}</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {successMessage && (
//               <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
//                 <div className="flex">
//                   <div className="flex-shrink-0">
//                     <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <div className="ml-3">
//                     <p className="text-sm text-green-700">{successMessage}</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="mb-6">
//               <p className="text-gray-600 mb-4">
//                 Select the categories you&apos;re interested in to personalize your article feed.
//                 {selectedCategories.length === 0 && " If no categories are selected, you'll see articles from all categories."}
//               </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
//               {categories.map((category) => (
//                 <div 
//                   key={category._id}
//                   className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
//                     selectedCategories.includes(category._id)
//                       ? 'border-blue-500 bg-blue-50'
//                       : 'border-gray-200 hover:border-blue-300'
//                   }`}
//                   onClick={() => handleCategoryToggle(category._id)}
//                 >
//                   <div className="flex items-center space-x-3">
//                     <input
//                       type="checkbox"
//                       checked={selectedCategories.includes(category._id)}
//                       onChange={() => handleCategoryToggle(category._id)}
//                       className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                     />
//                     <label className="flex-1 cursor-pointer">
//                       <span className="block text-lg font-medium text-gray-900">
//                         {category.name}
//                       </span>
//                       {category.description && (
//                         <span className="block text-sm text-gray-500">
//                           {category.description}
//                         </span>
//                       )}
//                     </label>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="flex justify-end space-x-4">
//               <button
//                 onClick={() => navigate('/dashboard')}
//                 className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSavePreferences}
//                 disabled={saving}
//                 className={`px-6 py-2 bg-blue-600 text-white rounded-lg transition-colors ${
//                   saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
//                 }`}
//               >
//                 {saving ? 'Saving...' : 'Save Preferences'}
//               </button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Preferences;