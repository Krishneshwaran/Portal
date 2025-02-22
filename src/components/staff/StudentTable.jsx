import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Pagination,
  IconButton,
} from "@mui/material";

import { FaCheckCircle } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5";
import {
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const StudentTable = ({
  students,
  selectedStudents,
  setSelectedStudents,
  filters,
  setFilters,
  sortConfig,
  setSortConfig,
  page,
  setPage,
  rowsPerPage,
  openFilterDialog,
  setOpenFilterDialog,
  testDetails = {} // Provide a default empty object
}) => {
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const applyFilters = () => {
      let filtered = students.filter(
        (student) =>
          (filters.collegename.length === 0 ||
            filters.collegename.includes(student.collegename)) &&
          (filters.dept.length === 0 || filters.dept.includes(student.dept)) &&
          (filters.year === "" || student.year === filters.year)
      );

      if (searchQuery.trim() !== "") {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (student) =>
            student.name.toLowerCase().includes(lowerQuery) ||
            student.regno.toLowerCase().includes(lowerQuery)
        );
      }

      setFilteredStudents(filtered);
      setPage(0);
    };

    applyFilters();
  }, [filters, students, searchQuery, setPage]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map((student) => student.regno));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleStudentSelect = (regno) => {
    setSelectedStudents((prev) =>
      prev.includes(regno)
        ? prev.filter((id) => id !== regno)
        : [...prev, regno]
    );
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedStudents = useMemo(() => {
    let sortableStudents = [...filteredStudents];
    if (sortConfig.key) {
      sortableStudents.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableStudents;
  }, [filteredStudents, sortConfig]);

  const handleFilterDialogOpen = () => {
    setOpenFilterDialog(true);
  };

  const handleFilterDialogClose = () => {
    setOpenFilterDialog(false);
  };

  const applyFilters = () => {
    setOpenFilterDialog(false);
  };

  const clearFilters = () => {
    setFilters({ collegename: [], dept: [], year: "" });
    setOpenFilterDialog(false);
  };

  const toggleFilter = (filterType, value) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      if (filterType === "year") {
        updatedFilters[filterType] = updatedFilters[filterType] === value ? "" : value;
      } else {
        if (!Array.isArray(updatedFilters[filterType])) {
          updatedFilters[filterType] = [];
        }
        if (updatedFilters[filterType].includes(value)) {
          updatedFilters[filterType] = updatedFilters[filterType].filter(
            (item) => item !== value
          );
        } else {
          updatedFilters[filterType].push(value);
        }
      }
      return updatedFilters;
    });
  };

  const handlePageChange = (event, value) => {
    setPage(value - 1);
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <TextField
          placeholder="Search students..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "50px",
              height: "40px",
              padding: "0 16px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "gray",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "darkgray",
            },
            "& .MuiInputLabel-root": {
              top: "-5px",
              fontSize: "0.9rem",
              color: "gray",
            },
            "& .MuiInputLabel-shrink": {
              top: "0px",
            },
          }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={handleFilterDialogOpen}
          sx={{
            borderColor: "#111933",
            backgroundColor: "#111933",
            color: "#fff",
            "&:hover": {
              color: "#111933",
              borderColor: "#111933",
              backgroundColor: "#fff",
            },
          }}
        >
          Filter
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ border: "1px solid #003366" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#111933", color: "white" }}>
            <TableRow>
              <TableCell padding="checkbox" sx={{ width: 40 }}>
                <Checkbox
                  indeterminate={
                    selectedStudents.length > 0 &&
                    selectedStudents.length < filteredStudents.length
                  }
                  checked={
                    filteredStudents.length > 0 &&
                    selectedStudents.length === filteredStudents.length
                  }
                  onChange={handleSelectAll}
                  sx={{
                    color: "white",
                    '&.Mui-checked': {},
                    '&.MuiCheckbox-indeterminate': {
                      color: "white",
                    },
                  }}
                />
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", cursor: "pointer", color: "white", width: 150 }}
                onClick={() => requestSort("name")}
              >
                Name{" "}
                {sortConfig.key === "name" && (
                  sortConfig.direction === "asc" ? (
                    <FontAwesomeIcon icon={faSortUp} className="ml-3" />
                  ) : (
                    <FontAwesomeIcon icon={faSortDown} className="ml-3" />
                  )
                )}
                {sortConfig.key !== "name" && <FontAwesomeIcon icon={faSort} className="ml-3" />}
              </TableCell>
              <TableCell sx={{ color: "white", width: 180 }}>
                Registration Number
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", cursor: "pointer", color: "white", width: 150 }}
                onClick={() => requestSort("dept")}
              >
                Department{" "}
                {sortConfig.key === "dept" && (
                  sortConfig.direction === "asc" ? (
                    <FontAwesomeIcon icon={faSortUp} className="ml-3" />
                  ) : (
                    <FontAwesomeIcon icon={faSortDown} className="ml-3" />
                  )
                )}
                {sortConfig.key !== "dept" && <FontAwesomeIcon icon={faSort} className="ml-3" />}
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", cursor: "pointer", color: "white", width: 150 }}
                onClick={() => requestSort("collegename")}
              >
                College Name{" "}
                {sortConfig.key === "collegename" && (
                  sortConfig.direction === "asc" ? (
                    <FontAwesomeIcon icon={faSortUp} className="ml-3" />
                  ) : (
                    <FontAwesomeIcon icon={faSortDown} className="ml-3" />
                  )
                )}
                {sortConfig.key !== "collegename" && <FontAwesomeIcon icon={faSort} className="ml-3" />}
              </TableCell>
              <TableCell sx={{ cursor: "pointer", color: "white", width: 80 }}>
                Year
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedStudents
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((student) => (
                <TableRow key={student.regno} hover>
                  <TableCell padding="checkbox" sx={{ width: 40 }}>
                    <Checkbox
                      checked={selectedStudents.includes(student.regno)}
                      onChange={() => handleStudentSelect(student.regno)}
                      disabled={testDetails?.visible_to?.includes(student.regno) || false} // Safely access visible_to
                    />
                  </TableCell>
                  <TableCell sx={{ width: 150 }}>{student.name}</TableCell>
                  <TableCell sx={{ width: 180 }}>{student.regno}</TableCell>
                  <TableCell sx={{ width: 150 }}>{student.dept}</TableCell>
                  <TableCell sx={{ width: 150 }}>{student.collegename}</TableCell>
                  <TableCell sx={{ width: 80 }}>{student.year}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="flex justify-center mt-6">
        <Pagination
          count={Math.ceil(filteredStudents.length / rowsPerPage)}
          page={page + 1}
          onChange={handlePageChange}
          sx={{
            '& .MuiPaginationItem-root': {
              color: '#111933',
            },
            '& .MuiPaginationItem-root.Mui-selected': {
              backgroundColor: '#111933',
              color: '#fff',
            },
            '& .MuiPaginationItem-root:hover': {
              backgroundColor: 'rgba(0, 9, 117, 0.4)',
              color:'#fff'
            },
          }}
        />
      </div>
      <Dialog
          open={openFilterDialog}
          onClose={handleFilterDialogClose}
          fullWidth
          maxWidth="md"
          PaperProps={{
            style: {
              width: '800px', // Increased width
              height: '530px', // Reduced height
              borderRadius: 15, // Rounded edges for the filter dialog
              backgroundColor: '#fff', // White background for the dialog
            },
          }}
          BackdropProps={{
            className: "fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm",
          }}
          TransitionProps={{ unmountOnExit: true }} // Remove sliding effect
        >
          <DialogTitle sx={{ fontWeight: "bold", mb: 1, color: "#111933", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Filter Options
            <IconButton onClick={handleFilterDialogClose} sx={{ color: "#111933" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ paddingTop: 0 }}>
            <Typography
              variant="h6"
              sx={{ mb: 1, fontWeight: "bold", color: "#111933" }}
            >
              Department
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {["AI&ML", "IT", "CSE", "AI&DS", "Mech", "EEE", "ECE", "CSD", "CST", "AERO", "MCT", "CIVIL", "Others"].map(
                (dept) => (
                  <Chip
                    key={dept}
                    label={dept}
                    clickable
                    onClick={() => toggleFilter("dept", dept)}
                    sx={{
                      cursor: "pointer",
                      backgroundColor: filters.dept.includes(dept)
                        ? "#111933"
                        : "rgba(225, 235, 255, 0.8)", // Light blue with low opacity
                      color: filters.dept.includes(dept) ? "#fff" : "#111933",
                      width: 'auto', // Allow width to adjust based on content
                      height: '35px', // Adjusted height
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center', // Center the text
                      borderRadius: '15px', // Rounded corners
                      whiteSpace: 'nowrap', // Prevent text wrapping
                      overflow: 'hidden', // Hide overflow text
                      textOverflow: 'ellipsis', // Show ellipsis for overflow text
                      "&:hover": {
                        backgroundColor: "#111933", // Change to #111933 on hover
                        color: "#fff", // Change text color to white on hover
                      },
                    }}
                  />
                )
              )}
            </Box>

            <Typography
              variant="h6"
              sx={{ mt: 2, mb: 1, fontWeight: "bold", color: "#111933" }}
            >
              Institution
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {["SNSCT", "SNSCE", "SNS Spine", "SNS Nursing", "SNS Pharmacy", "SNS Health Science", "SNS Academy", "SNS Physiotherapy"].map(
                (college) => (
                  <Chip
                    key={college}
                    label={college}
                    clickable
                    onClick={() => toggleFilter("collegename", college)}
                    sx={{
                      cursor: "pointer",
                      backgroundColor: filters.collegename.includes(college)
                        ? "#111933"
                        : "rgba(225, 235, 255, 0.8)", // Light blue with low opacity
                      color: filters.collegename.includes(college) ? "#fff" : "#111933",
                      width: 'auto', // Allow width to adjust based on content
                      height: '40px', // Adjusted height
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center', // Center the text
                      borderRadius: '15px', // Rounded corners
                      whiteSpace: 'nowrap', // Prevent text wrapping
                      overflow: 'hidden', // Hide overflow text
                      textOverflow: 'ellipsis', // Show ellipsis for overflow text
                      "&:hover": {
                        backgroundColor: "#111933", // Change to #111933 on hover
                        color: "#fff", // Change text color to white on hover
                      },
                    }}
                  />
                )
              )}
            </Box>

            <Typography
              variant="h6"
              sx={{ mt: 2, mb: 1, fontWeight: "bold", color: "#111933" }}
            >
              Year
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {["I", "II", "III", "IV"].map((year) => (
                <Chip
                  key={year}
                  label={year}
                  clickable
                  onClick={() => toggleFilter("year", year)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: filters.year === year
                      ? "#111933"
                      : "rgba(225, 235, 255, 0.8)", // Light blue with low opacity
                    color: filters.year === year ? "#fff" : "#111933",
                    width: 'auto', // Allow width to adjust based on content
                    height: '35px', // Adjusted height
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center', // Center the text
                    borderRadius: '15px', // Rounded corners
                    whiteSpace: 'nowrap', // Prevent text wrapping
                    overflow: 'hidden', // Hide overflow text
                    textOverflow: 'ellipsis', // Show ellipsis for overflow text
                    "&:hover": {
                      backgroundColor: "#111933", // Change to #111933 on hover
                      color: "#fff", // Change text color to white on hover
                    },
                  }}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={clearFilters}
              variant="outlined"
              sx={{
                color: "#111933",
                borderColor: "#111933",
                borderRadius: '10px', // Slightly curved
                width: '150px', // Adjusted width
                height: '40px', // Adjusted height
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: "nowrap",
                gap: '8px',
                "&:hover": {
                  backgroundColor: "#fff",
                  color: "#111933",
                },
              }}
            >
              <div className="rounded-full border border-[#111933] p-[2px]">
                <IoCloseCircleOutline className="text-[#111933]" />
              </div>

              Clear Filter
            </Button>
            <Button
              onClick={applyFilters}
              variant="contained"
              sx={{
                backgroundColor: "#111933",
                color: "#fff",
                borderRadius: '10px', // Slightly curved
                width: '150px', // Adjusted width
                height: '40px', // Adjusted height
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
                gap: '8px',
                "&:hover": {

                },
              }}
            >
              <div className="rounded-full border border-white ">
                <FaCheckCircle className="text-white" />
              </div>
              Apply Filters
            </Button>
          </DialogActions>
        </Dialog>
    </>
  );
};

export default StudentTable;
