import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import Loader from '../../layout/Loader';
import { Mail, Lock } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loginScattered from '../../assets/login image.png';
import snsLogo from '../../assets/Institution.png';

const StaffLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/staff/login/`,
        { email: formData.email, password: formData.password },
        { withCredentials: true }
      );

      Cookies.set('staffToken', response.data.tokens.access_token, { expires: 7 });
      Cookies.set('username', response.data.name, { expires: 7 });

      toast.success('Login successful!');
      navigate('/staffdashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid email or password';
      setErrorMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-stretch justify-center overflow-hidden bg-white">
      <ToastContainer />
      {loading && <Loader message="Logging you in..." />}

      {/* Left Side */}
      <div className="flex flex-1 p-8 relative items-center justify-center text-[#00296b]">
        {/* SNS Logo */}
        <div className="absolute top-6 left-6 flex items-center space-x-2">
          <img src={snsLogo} className="w-[70px]" alt="SNS Institutions Logo" />
          <p className="text-xl font-bold">SNS INSTITUTIONS</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col w-3/4 max-w-[400px]">
          <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-lg text-gray-500 mb-8">Please enter your details</p>

          {/* Email Input */}
          <div className="relative mb-6">
            <label className="text-sm font-medium mb-1">Email address</label>
            <div className="flex items-center border rounded-full p-3 mt-1 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
              <Mail className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="flex-1 focus:outline-none text-sm bg-transparent placeholder-gray-400"
                placeholder="test@example.com"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="relative mb-6">
            <label className="text-sm font-medium mb-1">Password</label>
            <div className="flex items-center border rounded-full p-3 mt-1 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
              <Lock className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="flex-1 focus:outline-none text-sm bg-transparent placeholder-gray-400"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>
            {/* Forgot Password Button */}
            <div className="text-right mt-2">
              <Link
                to="/forgotpassword"
                className="text-sm text-blue-600 underline hover:text-blue-800 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ffcc00] text-[#00296b] font-medium py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 mt-6"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      {/* Right Side */}
      <div className="flex flex-1 bg-[#fdc500] justify-center items-center flex-col text-[#00296b] p-4">
        <div className="relative w-[60%] h-[60%] flex justify-center items-center">
          <img src={loginScattered} className="w-full h-auto" alt="Illustration" />
        </div>
        <h2 className="text-2xl font-bold mt-4">SNS Assessment Platform</h2>
        <p className="text-sm mt-2">Just a couple of clicks and we start</p>
      </div>
    </div>
  );
};

export default StaffLogin;
