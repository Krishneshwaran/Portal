import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Loader from '../../layout/Loader'; // Import the Loader component
import loginImage from '../../assets/Login.png';

const StudentLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // Manage loading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader during the API call
    setErrorMessage(''); // Reset error message

    try {
      const response = await axios.post('https://vercel-1bge.onrender.com/api/student/login/', formData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      const { studentId } = response.data;
      localStorage.setItem('studentId', studentId);

      if (response.status === 200) {
        onLogin(studentId);
        navigate('/studentdashboard'); // Redirect to the student dashboard
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'An error occurred during login.');
    } finally {
      setLoading(false); // Hide loader after the API call
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      {loading && <Loader message="Logging you in..." />} {/* Show loader if loading */}
      <div className="max-w-7xl w-full bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row">
        {/* Image section */}
        <div 
          className="hidden md:block md:w-1/2 bg-cover bg-center min-h-[300px]" 
          style={{ backgroundImage: `url(${loginImage})` }}
        ></div>

        {/* Small screen image */}
        <div 
          className="md:hidden w-48 h-48 bg-cover ml-5 bg-center"
          style={{ backgroundImage: `url(${loginImage})` }}
        ></div>

        {/* Form section */}
        <div className={`w-full md:w-1/2 p-6 md:p-16 ${loading ? 'opacity-50' : ''}`}>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4 md:mb-8">
            SNS INSTITUTION<br />ASSESMENT-PORTAL
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 text-center mb-6 md:mb-10">
            Login in to your account
          </h2>
          
          {errorMessage && (
            <div className="mb-4 md:mb-6 text-red-600 text-center">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
            <div className="flex flex-col">
              <label htmlFor="email" className="mb-2 text-base md:text-lg font-medium text-gray-600">
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="px-3 py-2 md:px-4 md:py-3 border rounded-lg shadow-sm border-gray-300 focus:ring-yellow-500 focus:border-yellow-500 text-base md:text-lg"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="password" className="mb-2 text-base md:text-lg font-medium text-gray-600">
                Password:
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="px-3 py-2 md:px-4 md:py-3 border rounded-lg shadow-sm border-gray-300 focus:ring-yellow-500 focus:border-yellow-500 text-base md:text-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 md:py-4 text-white bg-amber-400 hover:bg-amber-500 rounded-lg text-lg md:text-xl font-medium focus:outline-none focus:ring-2 focus:ring-yellow-800 focus:ring-offset-2 transition-colors duration-200"
              disabled={loading} // Disable the button while loading
            >
              Login
            </button>

            <div className="mt-4 text-sm text-gray-600 text-center">
              <Link to="/StudentPasswordReset" className="text-yellow-600 hover:text-yellow-700">Forgot Password?</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
