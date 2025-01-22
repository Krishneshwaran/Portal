import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, MenuItem, Avatar, Tooltip } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import Cookies from "js-cookie";

import logo from "../../assets/Institution.png";

const StaffNavbar = () => {
  const [username, setUsername] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
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
    Cookies.remove("username");
    Cookies.remove("staffToken");
    navigate("/stafflogin");
    handleMenuClose();
  };

  const handleSettings = () => {
    navigate("/staffprofile");
    handleMenuClose();
  };

  useEffect(() => {
    const storedUsername = Cookies.get("username");
    if (storedUsername) {
      setUsername(decodeURIComponent(storedUsername));
    }

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div
        className={`flex sticky top-0 z-20 bg-white ${
          isScrolled ? "rounded-b-2xl" : "rounded-2xl"
        } p-1 mt-3 mx-3 justify-between items-center transition-all duration-300`}
      >
        <div className="flex items-center ml-9 gap-8">
          <img src={logo} alt="Logo" className="h-10" />
        </div>
        <div className="flex ml-38 items-center gap-8">
          <nav className="flex gap-6 text-black mt-2">
            <Tooltip title="Go to Home Dashboard">
              <Link
                to="/staffdashboard"
                className={`font-medium transition-all duration-300 relative ${
                  location.pathname === "/staffdashboard"
                    ? "text-yellow-500 font-bold"
                    : "text-[#000975]"
                }`}
              >
                Home
                {location.pathname === "/staffdashboard" && (
                  <span className="blinking-dot"></span>
                )}
              </Link>
            </Tooltip>
            <Tooltip title="View and Manage Students">
              <Link
                to="/staffstudentprofile"
                className={`font-medium transition-all duration-300 relative ${
                  location.pathname === "/staffstudentprofile"
                    ? "text-yellow-500 font-bold"
                    : "text-[#000975]"
                }`}
              >
                Student
                {location.pathname === "/staffstudentprofile" && (
                  <span className="blinking-dot"></span>
                )}
              </Link>
            </Tooltip>
            <Tooltip title="Access Library Resources">
              <Link
                to="/library"
                className={`font-medium transition-all duration-300 relative ${
                  location.pathname === "/library"
                    ? "text-yellow-500 font-bold"
                    : "text-[#000975]"
                }`}
              >
                Library
                {location.pathname === "/library" && (
                  <span className="blinking-dot"></span>
                )}
              </Link>
            </Tooltip>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-[#000975]">
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
      <style jsx>{`
        .blinking-dot {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          background-color: #fdc500;
          border-radius: 50%;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default StaffNavbar;
