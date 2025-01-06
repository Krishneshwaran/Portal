import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import Cookies from "js-cookie"; // Don't forget to import Cookies

import logo from "../../assets/snsihub.png";

const StaffNavbar = () => {
  const [username, setUsername] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    Cookies.remove("username"); // Remove the username cookie
    Cookies.remove("staffToken"); // Optionally remove other cookies
    navigate("/stafflogin"); // Navigate to login page after logout
    handleMenuClose();
  };

  const handleSettings = () => {
    navigate("/staffprofile"); // Navigate to the StaffProfile page
    handleMenuClose();
  };

  useEffect(() => {
    const storedUsername = Cookies.get("username");
    if (storedUsername) {
      setUsername(decodeURIComponent(storedUsername));
    }
  }, []);

  return (
    <>
      <div className={`flex bg-gradient-to-r from-[#00296B] to-[#0077B6] ${window.location.pathname === '/staff/students' || window.location.pathname === '/staffdashboard' ? 'rounded-t-2xl' : 'rounded-2xl'} p-4 mt-3 mx-3 justify-between items-center`}>
        <div className="flex items-center gap-8">
          <img src={logo} alt="Logo" className="h-10" />
        </div>
        <div className="flex ml-40 items-center gap-8">
          <nav className="flex gap-6 text-white mt-2"> {/* Added margin-top to move links down */}
            <Tooltip title="Go to Home Dashboard">
              <Link to="/staffdashboard" className={`font-medium transition-all duration-300 ${location.pathname === '/staffdashboard' ? 'text-yellow-500 border-b-2 border-yellow-500 font-bold' : 'text-white'}`}>
                Home
              </Link>
            </Tooltip>
            <Tooltip title="View and Manage Students">
              <Link to="/staffstudentprofile" className={`font-medium transition-all duration-300 ${location.pathname === '/staffstudentprofile' ? 'text-yellow-500 border-b-2 border-yellow-500 font-bold' : 'text-white'}`}>
                Student
              </Link>
            </Tooltip>
            <Tooltip title="Access Library Resources">
              <Link to="/library" className={`font-medium transition-all duration-300 ${location.pathname === '/library' ? 'text-yellow-500 border-b-2 border-yellow-500 font-bold' : 'text-white'}`}>
                Library
              </Link>
            </Tooltip>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-white">
          <div className="flex items-center mr-2 gap-2">
            <span>{username || "User"}</span>
            <button onClick={handleMenuOpen} className="p-2">
              <Avatar>{username ? username[0].toUpperCase() : "U"}</Avatar>
            </button>
          </div>
        </div>
      </div>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleSettings}>
          <SettingsIcon className="mr-2" /> Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon className="mr-2" /> Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default StaffNavbar;
