import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, User, BookOpen, School } from 'lucide-react';
import Loader from '../../layout/Loader';
import Button from './Button.jsx';

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    collegename: '',
    dept: '',
    year: '',
    regno: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/student/signup/`, formData);
      if (response.status === 201) {
        alert('Registration successful! Please log in.');
        navigate('/studentlogin');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'An error occurred during registration.');
    } finally {
      setLoading(false);
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

      {loading && <Loader message="Registering your account..." />}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-32 -left-32 h-[450px] w-[450px] animate-pulse-slow rounded-full bg-green-100 blur-3xl" />
        <div className="absolute top-0 right-0 h-[500px] w-[500px] animate-pulse-slow rounded-full bg-gradient-to-tr from-green-100 to-green-150 blur-3xl" />
      </div>

      <motion.div
  initial="hidden"
  animate="visible"
  variants={containerVariants}
  className="relative z-10 mx-auto w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
>
  <div className="w-full p-12">
    <motion.div variants={itemVariants} className="mb-10 text-center">
      <h1 className="text-4xl font-bold text-gray-800">SNS INSTITUTIONS</h1>
      <p className="text-xl font-sm text-gray-800">Create Your Account</p>
    </motion.div>

    <motion.form variants={itemVariants} onSubmit={handleRegister} className="space-y-8">
      {errorMessage && (
        <div className="mb-6 text-red-600 text-center">{errorMessage}</div>
      )}

      {/* Full Name Field */}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-200 bg-white py-4 pl-12 pr-4 text-gray-800 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            placeholder="Harlee"
          />
        </div>
      </div>

      {/* College Name Dropdown */}
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
          className="block w-full rounded-lg border border-gray-200 bg-white py-4 px-4 text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-200"
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

      {/* Department Dropdown */}
      <div>
        <label htmlFor="dept" className="mb-2 block text-sm font-medium text-gray-700">
          Department
        </label>
        <select
          id="dept"
          name="dept"
          required
          value={formData.dept}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-200 bg-white py-4 px-4 text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-200"
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

      {/* Year Dropdown */}
      <div>
        <label htmlFor="year" className="mb-2 block text-sm font-medium text-gray-700">
          Year
        </label>
        <select
          id="year"
          name="year"
          required
          value={formData.year}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-200 bg-white py-4 px-4 text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-200"
        >
          <option value="">Select Year</option>
          <option value="I">I</option>
          <option value="II">II</option>
          <option value="III">III</option>
          <option value="IV">IV</option>
        </select>
      </div>

      {/* Email and Password Fields */}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-200 bg-white py-4 pl-12 pr-4 text-gray-800 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            placeholder="test@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-200 bg-white py-4 pl-12 pr-4 text-gray-800 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            placeholder="••••••••"
          />
        </div>
      </div>

      {/* Submit Button */}
      <motion.div variants={itemVariants} className="pt-6">
        <Button type="submit" className="w-full">
          <span className="flex items-center justify-center gap-2">
            Register
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </span>
        </Button>
      </motion.div>
    </motion.form>
  </div>
</motion.div>
    </div>
  );
};

export default StudentRegister;
