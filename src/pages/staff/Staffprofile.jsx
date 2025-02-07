"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import ProfileIcon from "../../assets/Dashboard icon.png";

const StaffProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    department: "",
    collegename: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/staff/profile/`, {
          withCredentials: true,
        });
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch staff profile data.");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [API_BASE_URL]);

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setProfile((prevProfile) => ({
  //     ...prevProfile,
  //     [name]: value,
  //   }));
  // };

  // const handleSave = async () => {
  //   setSuccessMessage("");
  //   setError("");
  //   try {
  //     await axios.put(`${API_BASE_URL}/api/staff/profile/`, profile, {
  //       withCredentials: true,
  //     });
  //     setSuccessMessage("Profile updated successfully!");
  //   } catch (err) {
  //     setError("Failed to save staff profile data.");
  //   }
  // };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111933]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl m-auto p-9 h-screen">
      <div className="bg-white mt-10 rounded-lg shadow-lg overflow-hidden">
        {/* Header Bar */}
        <div className="h-12 bg-[#111933]"></div>

        <div className="px-8 pb-8">
          {/* Profile Image */}
          <div className="flex justify-center mt-4">
            <img
              src={ProfileIcon || "/placeholder.svg"}
              alt="Profile"
              className="w-40 h-40 rounded-full"
            />
          </div>

          {/* Alerts */}
          {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">{error}</div>}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">
              {successMessage}
            </div>
          )}

          {/* Form */}
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-[#111933] font-medium">Name</label>
              <input
                type="text"
                disabled
                name="name"
                value={profile.name}
                // onChange={handleChange}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#111933] text-[#111933]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-[#111933] font-medium">College</label>
              <input
                type="text"
                disabled
                name="collegename"
                value={profile.collegename}
                // onChange={handleChange}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#111933] text-[#111933]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-[#111933] font-medium">Department</label>
              <input
                type="text"
                disabled
                name="department"
                value={profile.department}
                // onChange={handleChange}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#111933] text-[#111933]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-[#111933] font-medium">Email</label>
              <input
                type="email"
                disabled
                name="email"
                value={profile.email}
                // onChange={handleChange}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#111933] text-[#111933]"
              />
            </div>

           
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;