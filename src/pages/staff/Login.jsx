import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Mail, Lock } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loginScattered from '../../assets/login-image.png';
import snsLogo from '../../assets/Institution.png';
import DTimg from '../../assets/SNS-DT Logo.png'


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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <ToastContainer />

      {/* Login Card */}
      <div className="relative bg-white shadow-lg rounded-2xl flex max-w-6xl w-full">

        {/* Left Side - Login Form */}
        <div className="flex flex-1 flex-col justify-center mt-10 p-20">
          {/* SNS Logo */}

          <img src={DTimg} className="w-[150px] absolute top-5 left-5" alt="SNS Institutions Logo" />



          <h1 className="text-2xl font-Urbanist mb-2 text-[#111933]">Welcome back!</h1>
          <p className="text-md text-gray-500 mb-6">Please enter your details</p>

          {/* Email Input */}
          <div className="relative mb-4">
            <label className="text-sm font-Urbanist mb-1">Username</label>
            <div className="flex items-center border rounded-lg p-3 shadow-sm">

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="flex-1 focus:outline-none text-sm  placeholder-gray-400"
                placeholder="test@example.com"
                required
              />
              <Mail className="w-5 h-5 text-white fill-slate-400" />
            </div>
          </div>

          {/* Password Input */}
          <div className="relative mb-4">
            <label className="text-sm font-Urbanist mb-1">Password</label>
            <div className="flex items-center border rounded-lg p-3 shadow-sm">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="flex-1 focus:outline-none text-sm placeholder-gray-400"
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
            {/* Forgot Password */}
            <div className="text-right mt-2">
              <Link to="/forgotpassword" className="text-sm text-blue-600 underline">
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            onClick={handleLogin}
            className="w-[70%] mx-auto bg-[#111933] text-white font-Urbanist py-2 rounded-lg shadow hover:shadow-md transition-all mt-5"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        {/* Right Side - Image and Text */}
        <div className="flex flex-1 bg-[#ffcc00] justify-center items-center flex-col text-[#111933] p-10">
          <div className="relative w-[100%] flex justify-center items-center">
            <img src={loginScattered} className="w-full h-auto" alt="Illustration" />
          </div>
          <div className='absolute bottom-10 text-center'>
            <h2 className="text-3xl font-Urbanist mt-4 ">SNS Assessment Platform</h2>
            <p className="text-sm ">just a couple of clicks and we start</p>
          </div>
        </div>
      </div>
    </div>

  );
};

export default StaffLogin;