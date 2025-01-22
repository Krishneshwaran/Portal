import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Loader from '../../layout/Loader';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import Button from '../student/Button';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    collegename: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        collegename: formData.collegename,
        password: formData.password,
      };

      const response = await axios.post(`${API_BASE_URL}/api/staff/signup/`, payload);

      if (response.data.message === 'Signup successful') {
        localStorage.setItem('token', response.data.token);
        navigate('/stafflogin');
      } else {
        throw new Error(response.data.message || 'Signup failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

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

      {isLoading && <Loader message="Creating your account..." />}

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
            <h4 className="text-lg font-medium text-gray-600 mt-4">Create Your Account</h4>
          </motion.div>

          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="mb-6 text-red-600 text-center">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-gray-200 bg-blue-50 py-3 pl-12 pr-4 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="collegename" className="mb-2 block text-sm font-medium text-gray-700">
                College Name
              </label>
              <select
                id="collegename"
                name="collegename"
                required
                value={formData.collegename}
                onChange={handleChange}
                className="block w-full rounded-xl border border-gray-200 bg-blue-50 py-3 px-4 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select College</option>
                <option value="SNSCE">SNSCE</option>
                <option value="SNSCT">SNSCT</option>
                <option value="SNS Nursing">SNS Nursing</option>
                <option value="SNS ARTS">SNS ARTS</option>
                <option value="SNS Spine">SNS Spine</option>
                <option value="SNS Pharmacy">SNS Pharmacy</option>
                <option value="SNS Physiotherapy">SNS Physiotherapy</option>
                <option value="SNS Health Science">SNS Health Science</option>
                <option value="SNS Academy">SNS Academy</option>
              </select>
            </div>

            <div>
              <label htmlFor="department" className="mb-2 block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                id="department"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                className="block w-full rounded-xl border border-gray-200 bg-blue-50 py-3 px-4 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select Department</option>
                <option value="AI & DS">AI & DS</option>
                <option value="AI & ML">AI & ML</option>
                <option value="IT">IT</option>
                <option value="CSE">CSE</option>
                <option value="CST">CST</option>
                <option value="CSD">CSD</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECHATRONICS">MECHATRONICS</option>
                <option value="AERO">AERO</option>
                <option value="OTHERS">OTHERS</option>
              </select>
            </div>

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
                  placeholder="Enter your email address"
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
                  className="absolute right-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-gray-200 bg-blue-50 py-3 pl-12 pr-12 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <motion.div variants={itemVariants} className="pt-6">
              <button
                type="submit"
                className="w-full py-3 text-white bg-blue-600 rounded-xl text-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="flex items-center justify-center gap-2">
                  Create Account
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="mt-6 text-center text-xs text-gray-500"
            >
              Already have an account?{' '}
              <Link
                to="/stafflogin"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </Link>
            </motion.p>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
