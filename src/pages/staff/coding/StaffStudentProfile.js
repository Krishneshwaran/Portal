import React, { useState, useEffect } from "react";
import { Pagination } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import Loader from "../../../layout/Loader";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  School as SchoolIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";

const normalizeString = (str) => {
  return str.replace(/[&]/g, '').toLowerCase();
};

const StaffStudentProfile = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState([]);
  const [collegeFilter, setCollegeFilter] = useState([]);
  const [yearFilter, setYearFilter] = useState("");
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/studentprofile/`)
      .then((response) => response.json())
      .then((data) => {
        setStudents(data.students);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, [API_BASE_URL]);

  const filteredStudents = students
    .filter((student) => {
      const matchesSearch = Object.values(student).some((value) =>
        normalizeString(value).includes(normalizeString(searchTerm))
      );
      const matchesDepartment =
        departmentFilter.length === 0 || departmentFilter.some((filter) => normalizeString(student.dept).includes(normalizeString(filter)));
      const matchesCollege =
        collegeFilter.length === 0 || collegeFilter.some((filter) => normalizeString(student.collegename).includes(normalizeString(filter)));
      const matchesYear = yearFilter === "" || student.year === yearFilter;
      return matchesSearch && matchesDepartment && matchesCollege && matchesYear;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const isAsc = sortConfig.direction === "ascending" ? 1 : -1;
      return isAsc * (a[sortConfig.key] < b[sortConfig.key] ? -1 : 1);
    });

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const yearCounts = ["I", "II", "III", "IV"].reduce((acc, year) => {
    acc[year] = students.filter((student) => student.year === year).length;
    return acc;
  }, {});

  const handleFilterDialogOpen = () => {
    setOpenFilterDialog(true);
  };

  const applyFilters = () => {
    setOpenFilterDialog(false);
  };

  const clearFilters = () => {
    setDepartmentFilter([]);
    setCollegeFilter([]);
    setYearFilter("");
    setOpenFilterDialog(false);
  };

  const handleFilterDialogClose = () => {
    setOpenFilterDialog(false);
  };

  const toggleFilter = (filterType, value) => {
    if (filterType === "dept") {
      setDepartmentFilter((prevFilters) =>
        prevFilters.includes(value)
          ? prevFilters.filter((filter) => filter !== value)
          : [...prevFilters, value]
      );
    } else if (filterType === "collegename") {
      setCollegeFilter((prevFilters) =>
        prevFilters.includes(value)
          ? prevFilters.filter((filter) => filter !== value)
          : [...prevFilters, value]
      );
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const areFiltersApplied = () => {
    return departmentFilter.length > 0 || collegeFilter.length > 0 || yearFilter !== "";
  };

  if (isLoading) {
    return <Loader />; // Render the Loader component while loading
  }

  return (
    <div className=" bg-[#f4f6ff86]">
      <div className="p-6 ml-16 mr-14 min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Academic Profile Management</h1>
        <p className="text-gray-600 mb-4">A comprehensive platform for analyzing and overseeing student profiles across academic cohorts.</p>

        {/* Year Count Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {Object.entries(yearCounts).map(([year, count]) => (
            <div key={year} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm">{year} Year</p>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-gray-500 text-sm">Students</p>
                </div>
                <SchoolIcon className="text-yellow-500 bg-white p-2 rounded-xl" style={{ fontSize: 50 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter Section */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative border border-gray-300 rounded-3xl">
            <input
              type="text"
              placeholder="Search students..."
              className="focus:outline-none focus:ring-1 focus:ring-blue-400 w-full ring-1 ring-blue-400 rounded-3xl pl-10 pr-4 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="flex space-x-2">
            <button
              className="bg-white text-[#000975] px-4 py-2 rounded-xl border-2 border-amber-100 flex items-center"
              onClick={handleFilterDialogOpen}
            >
              <FilterListIcon className="mr-2" />
              Filter
            </button>
            {areFiltersApplied() && (
              <button
                className="bg-white text-[#000975] px-4 py-2 rounded-xl border-2 border-amber-100 flex items-center"
                onClick={clearFilters}
              >
                <ClearIcon className="mr-2" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="grid grid-cols-5 gap-4 p-4 bg-[#000975] text-white font-medium">
            <p onClick={() => requestSort("name")} className="flex items-center cursor-pointer">
              Name
              {sortConfig.key === "name" && (
                sortConfig.direction === "ascending" ? (
                  <FontAwesomeIcon icon={faSortUp} className="ml-3" />
                ) : (
                  <FontAwesomeIcon icon={faSortDown} className="ml-3" />
                )
              )}
              {sortConfig.key !== "name" && <FontAwesomeIcon icon={faSort} className="ml-3" />}
            </p>
            <p className="flex justify-center">Department</p>
            <p onClick={() => requestSort("collegename")} className="flex items-center justify-center cursor-pointer">
              College
              {sortConfig.key === "collegename" && (
                sortConfig.direction === "ascending" ? (
                  <FontAwesomeIcon icon={faSortUp} className="ml-3" />
                ) : (
                  <FontAwesomeIcon icon={faSortDown} className="ml-3" />
                )
              )}
              {sortConfig.key !== "collegename" && <FontAwesomeIcon icon={faSort} className="ml-3" />}
            </p>
            <p className="flex justify-center">Year</p>
            <p className="flex justify-center">Report</p>
          </div>
          {filteredStudents
            .slice(indexOfFirstStudent, indexOfLastStudent)
            .map((student) => (
              <div
                key={student.regno}
                className="grid grid-cols-5 gap-4 p-4 border-t hover:bg-blue-100"
              >
                <p>{student.name}</p>
                <p className="flex justify-center">{student.dept}</p>
                <p className="flex justify-center">{student.collegename}</p>
                <p className="flex justify-center">{student.year}</p>
                <p className="flex justify-center">
                  <button
                    className="text-[#000975] hover:text-blue-700"
                    onClick={() => navigate(`/studentstats/${student.regno}`)}
                  >
                    <VisibilityIcon />
                  </button>
                </p>
              </div>
            ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, value) => setCurrentPage(value)}
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#000975', // Text color for pagination items
              },
              '& .MuiPaginationItem-root.Mui-selected': {
                backgroundColor: '#FDC500', // Background color for selected item
                color: '#fff', // Text color for the selected item
              },
              '& .MuiPaginationItem-root:hover': {
                backgroundColor: 'rgba(0, 9, 117, 0.1)', // Hover effect
              },
            }}
          />
        </div>

        {/* Filter Dialog */}
        <Dialog
          open={openFilterDialog}
          onClose={handleFilterDialogClose}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            style: {
              borderRadius: 15, // Rounded edges for the filter dialog
            },
          }}
          BackdropProps={{
            className: "fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm",
          }}
        >
          <DialogTitle sx={{ fontWeight: "bold", mb: 2, color: "#003366" }}>
            Filter Options
          </DialogTitle>
          <DialogContent>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: "bold", color: "#003366" }}
            >
              DEPARTMENT
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {["AI&ML", "IT", "CSE", "AI&DS", "Mech", "EEE", "ECE", "CSD", "CST", "AREO", "Mechatronics", "CIVIL", "Others"].map(
                (dept) => (
                  <Chip
                    key={dept}
                    label={dept}
                    clickable
                    onClick={() => toggleFilter("dept", dept)}
                    color={departmentFilter.includes(dept) ? "primary" : "default"}
                    sx={{
                      cursor: "pointer",
                      backgroundColor: departmentFilter.includes(dept)
                        ? "#FDC500"
                        : "#000975",
                      color: departmentFilter.includes(dept) ? "#fff" : "#fff",
                    }}
                  />
                )
              )}
            </Box>

            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: "bold", color: "#003366" }}
            >
              INSTITUTION
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {["SNSCT", "SNSCE", "SNS Spine", "SNS Nursing  ", "SNS Pharmacy", "SNS Health Science", "SNS Academy", "SNS Physiotherapy"].map(
                (college) => (
                  <Chip
                    key={college}
                    label={college}
                    clickable
                    onClick={() => toggleFilter("collegename", college)}
                    color={collegeFilter.includes(college) ? "primary" : "default"}
                    sx={{
                      cursor: "pointer",
                      backgroundColor: collegeFilter.includes(college)
                        ? "#FDC500"
                        : "#000975",
                      color: collegeFilter.includes(college) ? "#fff" : "#fff",
                    }}
                  />
                )
              )}
            </Box>

            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: "bold", color: "#003366" }}
            >
              YEAR
            </Typography>
            <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
              <InputLabel sx={{ color: "#003366" }}>Year</InputLabel>
              <Select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                label="Year"
                name="year"
                sx={{ color: "#003366" }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="I">I</MenuItem>
                <MenuItem value="II">II</MenuItem>
                <MenuItem value="III">III</MenuItem>
                <MenuItem value="IV">IV</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={clearFilters}
              color="primary"
              sx={{ color: "#003366", borderColor: "#003366" }}
            >
              Clear All Filters
            </Button>
            <Button
              onClick={applyFilters}
              color="primary"
              sx={{ color: "#003366", borderColor: "#003366" }}
            >
              Apply Filters
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default StaffStudentProfile;
