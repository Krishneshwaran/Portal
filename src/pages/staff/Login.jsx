import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import Loader from '../../layout/Loader';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StaffLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [staffData, setStaffData] = useState({
    full_name: '',
    email: '',
    department: '',
    collegename: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/staff/login/`,
        {
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );

      // Store tokens and user info in cookies
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

  // Fetch staff data after login
  const fetchStaffData = async () => {
    try {
      const token = Cookies.get('staffToken');
      if (!token) {
        console.error('No token found! Please login again.');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/staff/profile/`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { full_name, email, department, collegename } = response.data;
      setStaffData({
        full_name,
        email,
        department,
        collegename,
      });
    } catch (err) {
      console.error('Error fetching staff data:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-16">
      <ToastContainer />
      <style>
        {`
          @keyframes pulse-slow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.85; }
          }
          .animate-pulse-slow {
            animation: pulse-slow 5s linear infinite;
          }
        `}
      </style>

      {loading && <Loader message="Logging you in..." />}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-32 -left-32 h-[450px] w-[450px] animate-pulse-slow rounded-full bg-blue-100 blur-3xl" />
        <div className="absolute top-0 right-0 h-[500px] w-[500px] animate-pulse-slow rounded-full bg-gradient-to-tr from-blue-100 to-blue-150 blur-3xl" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 mx-auto w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="w-full p-12">
          <motion.div variants={itemVariants} className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-gray-800">SNS INSTITUTIONS</h1>
            <p className="text-lg font-medium text-gray-600 mt-4">Staff Login</p>
          </motion.div>

          <motion.form variants={itemVariants} onSubmit={handleLogin} className="space-y-8">
            {errorMessage && (
              <div className="mb-6 text-red-600 text-center">{errorMessage}</div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-gray-200 bg-blue-50 py-3 pl-12 pr-4 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-gray-200 bg-blue-50 py-3 pl-12 pr-12 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <motion.div variants={itemVariants} className="pt-6">
              <button
                type="submit"
                className="w-full py-3 text-white bg-blue-600 rounded-xl text-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="flex items-center justify-center gap-2">
                  Login
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default StaffLogin;
