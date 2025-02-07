import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MdOutlinePublish } from "react-icons/md";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Pagination,
  MenuItem,
  IconButton,
  Typography,
  Chip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { parseISO, isAfter } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';
import { IoCloseCircleOutline } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";
//img imports
import heroImg from "../../../assets/test_view_hero_img.png";
import StudentTable from "../../../components/staff/StudentTable";
import Loader from "../../../layout/Loader"; // Import the Loader component
import { XCircle } from 'lucide-react';
import DownloadContestData from "../../../components/staff/report/DownloadContestData"; // Import the DownloadContestData component

function formatDateTime(dateString) {
  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert to 12-hour format (0 becomes 12)

  return `${day} ${month} ${year}, ${hours}:${minutes} ${period}`;
}

const RulesAndRegulations = ({ assessmentOverview }) => {
  // Function to parse the guidelines and identify bullet points or notations
  const parseGuidelines = (guidelines) => {
    if (!guidelines) return [];

    // Split the guidelines by new lines
    const lines = guidelines.split('\n');

    // Identify bullet points or notations
    const items = lines.map((line) => {
      // Check if the line starts with a bullet point or notation
      const match = line.match(/^(\d+\.|\d+\)|\*|\-|\+)\s(.*)/);
      if (match) {
        return { type: match[1], content: match[2] };
      }
      return { type: '', content: line };
    });

    return items;
  };

  const items = parseGuidelines(assessmentOverview?.guidelines);

  return (
    <section className="flex p-6 shadow-sm flex-1 bg-[#ffffff] mb-6 rounded-lg">
      {/* rules and regulations */}
      <div className="mb-6 flex-[2] mr-12">
        <p className="text-2xl font-semibold text-[#111933] mb-2">
          {" "}
          Rules and Regulations{" "}
        </p>
        <p className="text-md font-semibold ml-6 text-[#111933] mb-2">
          Instructions: Read carefully; contact the Department for clarifications.
        </p>
        {items.length > 0 ? (
          <ul className="list-disc list-inside ml-7">
            {items.map((item, index) => (
              <li key={index} className="text-md text-black break-words ml-3 text-justify">
                {item.content}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-md text-black break-words text-justify">
            {assessmentOverview?.guidelines}
          </p>
        )}
      </div>
    </section>
  );
};

const ViewTest = () => {
  const themeButtonStyle =
    "px-5 p-2 rounded-xl bg-transparent border-[#111933] border-[1px] mx-2 hover:bg-[#b6c5f7]";

  const [showDownload, setShowDownload] = useState(false);
  const { contestId } = useParams();
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const [popup, setPopup] = useState("some popup message");
  const [showPopup, setShowPopup] = useState(false);
  const [popupFunction, setPopupFunction] = useState();
  const [page, setPage] = useState(0); // Ensure pagination starts at page 0

  const navigate = useNavigate(); // Used for navigation
  const [testDetails, setTestDetails] = useState(null);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]); // Define filteredStudents
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filters, setFilters] = useState({
    collegename: [],
    dept: [],
    year: [],
    status: "",
    searchText: "",
  }); // Extended filters
  const [dialogFilters, setDialogFilters] = useState({
    collegename: "",
    dept: "",
    year: "",
  }); // Define dialogFilters
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [dialogStudents, setDialogStudents] = useState([]); // To store all students for the dialog
  const [filteredDialogStudents, setFilteredDialogStudents] = useState([]); // Define filteredDialogStudents
  const [rowsPerPage, setRowsPerPage] = useState(10); // Set rowsPerPage to 10
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
  const [isPublished, setIsPublished] = useState(false); // Result published state
  const [loading, setLoading] = useState(true); // Set initial loading state to true
  const [modalOpen, setModalOpen] = useState(false); // State to manage modal
  const [showDeletePopup, setShowDeletePopup] = useState(false); // State for delete confirmation popup
  const [showPublishPopup, setShowPublishPopup] = useState(false); // State for publish confirmation popup

  const assessmentOverview = testDetails?.assessmentOverview || {};
  const isRegistrationPeriodOver = assessmentOverview?.registrationEnd
    ? isAfter(new Date(), parseISO(assessmentOverview.registrationEnd))
    : false;
  const isOverallStatusClosed = testDetails?.overall_status === 'closed';

  const handlePublish = async () => {
    if (isPublished) {
      toast.error("Results are already published.");
      return;
    }

    // Confirm before publishing
    const confirmPublish = window.confirm(
      "Are you sure you want to publish the results?"
    );
    if (!confirmPublish) return;

    try {
      setIsPublished(true); // Disable button during API call

      // Debugging: Log the contestId and full URL
      console.log("Contest ID:", contestId);
      console.log(
        "API URL:",
        `${API_BASE_URL}/api/mcq/publish-result/${contestId}/`
      );

      // API call to publish results
      const response = await axios.post(
        `${API_BASE_URL}/api/mcq/publish-result/${contestId}/`
      );
      if (response.status === 200) {
        setIsPublished(true); // Mark as published
        toast.success("Results published successfully.");
      } else {
        toast.error("Failed to publish results. Please try again.");
      }
    } catch (error) {
      console.error("Error publishing results:", error);
      toast.error(
        "An error occurred while publishing the results. Please try again."
      );
    } finally {
      setIsPublished(false); // Re-enable the button
    }
  };

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/contests/${contestId}/`
        );
        setTestDetails(response.data);

        // Safely handle optional student_details
        const updatedStudents = (response.data.student_details || []).map(
          (student) => ({
            ...student,
            year: student.year || "N/A",
            status: student.status || "Unknown",
          })
        );
        setStudents(updatedStudents);
        setFilteredStudents(updatedStudents);

        // Safely handle optional testConfiguration
        const passPercentage = response.data.testConfiguration?.passPercentage;
        if (passPercentage !== undefined) {
          sessionStorage.setItem("passPercentage", passPercentage);
        }
      } catch (err) {
        setError("Failed to fetch test details");
        console.error(err);
      } finally {
        setLoading(false); // Stop the loading animation
      }
    };

    if (contestId) fetchTestDetails();
  }, [contestId, API_BASE_URL]);

  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/student/`);
        const updatedStudents = response.data.map((student) => ({
          ...student,
          year: student.year || "N/A", // Ensure year always has a value
        }));
        setDialogStudents(updatedStudents); // Set the data for the dialog
        setFilteredDialogStudents(updatedStudents); // Initialize the filtered data
      } catch (error) {
        console.error("Failed to fetch all students:", error);
      }
    };

    if (publishDialogOpen) fetchAllStudents();
  }, [publishDialogOpen, API_BASE_URL]);

  // Handle Input Change
  const handleInputChange = (e, field, section) => {
    const { value, checked, type } = e.target;
    setTestDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails };
      if (section) {
        updatedDetails[section] = {
          ...updatedDetails[section],
          [field]: type === "checkbox" ? checked : value,
        };
      } else {
        updatedDetails[field] = value;
      }
      return updatedDetails;
    });
  };

  // Handle Save Changes
  const handleSave = async () => {
    try {
      console.log("Updated Test Data:", testDetails);
      await axios.put(
        `${API_BASE_URL}/api/contests/${contestId}/`,
        testDetails
      );

      setIsEditing(false);
      setLoading(true);

      await axios.put(
        `${API_BASE_URL}/api/contests/${contestId}/`,
        testDetails
      );
      toast.success("Test details updated successfully");

      // Wait for a moment to show the animation before refreshing
      setTimeout(() => {
        window.location.reload(); // Refresh the page
      }, 1500);
    } catch (err) {
      setTimeout(() => {
        window.location.reload(); // Refresh the page
      }, 1500);
      console.error("Error:", err);
    } finally {
      setLoading(false); // Stop the loading animation
    }
  };

  // Handle Filter Changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // Apply Filters
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...students];

      // Filter by Status
      if (filters.status) {
        filtered = filtered.filter(
          (student) =>
            student.status?.toLowerCase() === filters.status.toLowerCase()
        );
      }

      // Filter by Year (Roman numerals)
      if (filters.year.length > 0) {
        filtered = filtered.filter((student) =>
          filters.year.includes(student.year)
        );
      }

      // Search Text Filter (only for student name)
      if (filters.searchText) {
        filtered = filtered.filter((student) =>
          student.name.toLowerCase().includes(filters.searchText.toLowerCase())
        );
      }

      // Filter by College Name
      if (filters.collegename.length > 0) {
        filtered = filtered.filter((student) =>
          filters.collegename.some((college) =>
            student.collegename.toLowerCase().includes(college.toLowerCase())
          )
        );
      }

      // Filter by Department
      if (filters.dept.length > 0) {
        filtered = filtered.filter((student) =>
          filters.dept.some((dept) =>
            student.dept.toLowerCase().includes(dept.toLowerCase())
          )
        );
      }

      setFilteredStudents(filtered);
      setPage(0); // Reset to the first page when filters change
    };

    applyFilters();
  }, [filters, students]);

  // Manage Selected Students
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

  const handleStudentRemove = (regno) => {
    setTestDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails };
      updatedDetails.visible_to = updatedDetails.visible_to.filter(
        (studentRegno) => studentRegno !== regno
      );
      return updatedDetails;
    });
  };

  const handleAddStudent = () => {
    setTestDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails };
      const newVisibleTo = new Set([
        ...updatedDetails.visible_to,
        ...selectedStudents,
      ]);
      updatedDetails.visible_to = Array.from(newVisibleTo); // Avoid duplicates
      return updatedDetails;
    });
    setPublishDialogOpen(false);
  };

  const handleCloseSession = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/mcq/close-session/${contestId}/`);
      toast.success("Session closed successfully.");
      navigate("/staffdashboard", {
        state: {
          toastMessage: "Assessment session has been closed.",
          testStatus: "closed", // This triggers Dashboard re-fetch
        },
      });
    } catch (error) {
      console.error("Error closing session:", error);
      toast.error("Failed to close the session. Please try again.");
    }
  };

  // Handle Delete Contest
  const handleDeleteContest = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/mcq/delete-contest/${contestId}/`
      );
      toast.success("Contest deleted successfully.");
      navigate("/staffdashboard", {
        state: {
          toastMessage: "Assessment has been deleted.",
        },
      });
    } catch (error) {
      console.error("Error deleting contest:", error);
      toast.error("Failed to delete the contest. Please try again.");
    }
  };

  if (error) return <div>{error}</div>;
  if (loading) return <Loader />; // Render the Loader component while loading

  const handleViewClick = (student) => {
    if (student.status.toLowerCase() === "yet to start") {
      setModalOpen(true);
    } else if (student.status.toLowerCase() === "started") {
      setModalOpen(true);
    } else {
      navigate(`${student.studentId}`);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  if (error) return <div>{error}</div>;
  if (loading) return <Loader />; // Render the Loader component while loading

  const {
    testConfiguration,
    student_details,
    sections,
  } = testDetails || {};

  const handlePageChange = (event, value) => {
    setPage(value - 1); // Adjust page value to be zero-based
  };

  const indexOfLastStudent = (page + 1) * rowsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - rowsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  // Filter Dialog Functions
  const handleFilterDialogOpen = () => {
    setOpenFilterDialog(true);
  };

  const handleFilterDialogClose = () => {
    setOpenFilterDialog(false);
  };

  const toggleFilter = (filterType, value) => {
    setFilters((prevFilters) => {
      let newFilters = { ...prevFilters };
      if (filterType === "collegename") {
        newFilters.collegename = newFilters.collegename.includes(value)
          ? newFilters.collegename.filter((college) => college !== value)
          : [...newFilters.collegename, value];
      } else if (filterType === "dept") {
        newFilters.dept = newFilters.dept.includes(value)
          ? newFilters.dept.filter((dept) => dept !== value)
          : [...newFilters.dept, value];
      } else if (filterType === "year") {
        newFilters.year = newFilters.year.includes(value)
          ? newFilters.year.filter((year) => year !== value)
          : [...newFilters.year, value];
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      collegename: [],
      dept: [],
      year: [],
      status: "",
      searchText: "",
    });
    setOpenFilterDialog(false);
  };

  const applyFilters = () => {
    setOpenFilterDialog(false);
  };

  return (
    <div className="min-h-screen relative">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div
        className={`w-screen h-screen bg-[#0000005a] fixed ${
          showPopup ? "flex" : "hidden"
        } items-center justify-center z-10 px-10`}
      >
        <div className="h-fit p-4 rounded-xl bg-white flex flex-col text-center min-w-[300px] w-1/2 max-w-[70%]">
          <i className="bi bi-exclamation-diamond-fill text-rose-700 text-7xl"></i>
          <p className="text-3xl mt-8"> Warning </p>
          <p className="text-xl mt-1 w-[90%] self-center"> {popup} </p>
          <div className="flex space-x-2 mt-8">
            <button
              className="px-5 p-2 rounded-lg flex-1 bg-[#11193361] border-[#111933] border-[1px] hover:bg-[#11193390]"
              onClick={() => popupFunction()}
            >
              Okay
            </button>
            <button
              className={`${themeButtonStyle} rounded-lg flex-1 m-0`}
              onClick={() => setShowPopup(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {showDeletePopup && (
  <div className="fixed inset-0 bg-[#0000005a] flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-white p-8 w-[500px] rounded-xl shadow-lg text-center">
      {/* Warning Icon */}
      <div className="text-red-600 mb-4">
        <svg
          className="w-14 h-14 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-red-600">Warning</h2>

      {/* Description */}
      <p className="text-lg text-gray-700 mt-2">
        Are you sure you want to delete the assessment?
      </p>

      {/* Warning Message */}
      <p className="text-sm text-red-500 mt-2">
        <strong>Note:</strong> This action cannot be undone.
      </p>

      {/* Buttons */}
      <div className="flex justify-center mt-6 space-x-32">
        <button
          className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg transition"
          onClick={() => setShowDeletePopup(false)}
        >
          Cancel
        </button>
        <button
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          onClick={() => {
            handleDeleteContest();
            setShowDeletePopup(false);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}


{showPublishPopup && (
  <div className="fixed inset-0 bg-[#0000005a] flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-white p-8 w-[500px] rounded-xl shadow-lg text-center">
      {/* Title with Icon */}
      <div className="flex items-center justify-center space-x-3">
        <svg
          className="w-8 h-8 text-green-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
        <h2 className="text-2xl font-semibold">Confirm Publish</h2>
      </div>

      {/* Description */}
      <p className="text-md text-gray-700 mt-4">
        Are you sure you want to publish the assessment? Once published, it will be visible to all participants.
      </p>

      {/* Warning Message */}
      <p className="text-sm text-red-500 mt-2">
        <strong>Note:</strong> This action cannot be undone.
      </p>

      {/* Buttons */}
      <div className="flex justify-center mt-6 space-x-44">
        
        <button
          className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg transition"
          onClick={() => setShowPublishPopup(false)}
        >
          Cancel
        </button>
        <button
          className="px-6 py-2 bg-[#111933] hover:bg-blue-900 text-white rounded-lg transition"
          onClick={() => {
            handlePublish();
            setShowPublishPopup(false);
          }}
        >
          Yes, Publish
        </button>
      </div>
    </div>
  </div>
)}


      <div className="p-14 bg-blue-50 min-h-full">
        {/* Header Section */}
        <section className="flex p-6 shadow-sm flex-1 bg-white mb-6 rounded-lg text-[#111933] items-start">
          {/* details */}
          <div className="flex-1 p-2 flex flex-col mr-12 justify-between">
            <div className="mb-6">
              <p className="text-2xl font-semibold mb-2">
                {assessmentOverview?.name}{" "}
              </p>
              <p className="text-sm text-black break-words text-justify">
                {assessmentOverview?.description}
              </p>
            </div>

            <div className="mt-4 border-2  rounded-lg">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                {/* Table Header */}
                <thead className="bg-[#111933] text-white">
                  <tr>
                    {[
                      "Registration Start",
                      "Total Duration",
                      "Total Attendees",
                      "Registration End",
                    ].map((title, index) => (
                      <th
                        key={index}
                        className={`relative font-normal py-2 px-6 text-center ${
                          index === 0 ? "rounded-tl-lg" : index === 3 ? "rounded-tr-lg" : ""
                        }`}
                      >
                        {title}
                        {index !== 0 && (
                          <span
                            className="absolute top-1/2 -translate-y-1/2 left-0 h-3/4 w-[1px] bg-gray-200"
                            style={{ marginTop: "0.001rem", marginBottom: "2rem" }}
                          ></span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                {/* Table Body */}
                <tbody>
                  <tr className="border-b border-gray-300 hover:bg-gray-100">
                    <td className="py-3 px-6 text-center ">
                      {formatDateTime(assessmentOverview?.registrationStart)}
                    </td>
                    <td className="py-3 px-6 text-center ">
                      {`${testConfiguration?.duration?.hours}:${testConfiguration?.duration?.minutes} hrs`}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {student_details?.length || 0}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {formatDateTime(assessmentOverview?.registrationEnd)}
                    </td>
                  </tr>
                  {/* Add more rows as needed */}
                </tbody>
              </table>
            </div>
          </div>

          {/* hero img */}
          <img src={heroImg} alt="Hero" className="w-[200px] ml-1 lg:w-[250px]" />
        </section>

        <section className="flex space-x-6 flex-1 mb-6">
          {/* Progress Details */}
          <div className="flex-1 flex flex-col items-center bg-white text-[#111933] border border-gray-300 rounded-xl shadow-md">
  {/* Header */}
  <p className="bg-[#111933] rounded-t-xl py-3 text-[#ffffff] text-lg font-medium w-full text-center">
    Progress Details
  </p>

  {/* Body */}
  <div className="flex flex-col w-full px-6 py-6 space-y-4">
    <div className="flex justify-between items-center w-full">
      <p className="font-light">Assigned</p>
      <p className="font-light">{student_details.length}</p>
    </div>
    <div className="flex justify-between items-center w-full">
      <p className="font-light">Yet to Complete</p>
      <p className="font-light">{student_details.filter(student => student.status === 'Yet to Complete').length}</p>
    </div>
    <div className="flex justify-between items-center w-full">
      <p className="font-light">Completed</p>
      <p className="font-light">{student_details.filter(student => student.status === 'Completed').length}</p>
    </div>
  </div>
</div>


  {/* Question & Section Details */}
  <div className="flex-1 flex flex-col items-center bg-white text-[#111933] border border-gray-300 rounded-xl shadow-md">
  {/* Header */}
  <p className="bg-[#111933] rounded-t-xl py-3 text-[#ffffff] text-lg font-medium w-full text-center">
    Question & Section Details
  </p>

  {/* Body */}
  <div className="flex flex-col w-full px-6 py-6 space-y-6 ">
    <div className="flex justify-between items-center w-full">
      <p className="font-light">No. of Questions</p>
      <p className="font-light">{testConfiguration?.questions || 0}</p>
    </div>
    {sections?.length > 0 && (
      <div className="flex justify-between items-center w-full">
        <p className="font-light">No. of Sections</p>
        <p className="font-light">{sections?.length || 0}</p>
      </div>
    )}
    <div className="flex justify-between items-center w-full">
      <p className="font-light">Total Marks</p>
      <p className="font-light">{testConfiguration?.totalMarks || 0}</p>
    </div>
  </div>
</div>


  

  {/* Sections & Questions Table */}
  <div className="flex-1 flex flex-col text-center bg-white text-[#111933] border-[1px] border-gray-200 rounded-md pb-2">
    <p className="bg-[#111933] rounded-tl-md rounded-tr-md p-2 text-[#ffffff] text-lg font-normal">
      Sections & Questions
    </p>
    <div className="grid grid-cols-2 items-center font-semibold p-4">
      <p className="text-center p-2 border-r-[1px] border-[#111933] border-b-[1px]">
        Sections
      </p>
      <p className="text-center p-2 border-b-[1px] border-[#111933]">
        Questions
      </p>
    </div>
    {(sections ?? []).length === 0 ? (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-center font-semibold">
          !! No Sections here to Display !!
        </p>
      </div>
    ) : (
      <>
        {sections?.map((section, index) => (
          <div key={index} className="grid grid-cols-2 flex-1 items-stretch">
            <p className="text-center border-r-[1px] border-[#111933] border-b-[1px] flex items-center justify-center p-2">
              {section.sectionName}
            </p>
            <p className="text-center border-b-[1px] border-[#111933] flex items-center justify-center p-2">
              {section.numQuestions}
            </p>
          </div>
        ))}
        <div className="grid grid-cols-2 flex-1 items-stretch">
          <p className="text-center border-r-[1px] border-[#111933] flex items-center justify-center p-2">
            Total
          </p>
          <p className="text-center flex items-center justify-center p-2">
            {testConfiguration?.questions || 0}
          </p>
        </div>
      </>
    )}
  </div>

  {/* Proctoring Enabled */}
  <div className="flex-1 flex flex-col text-center bg-white text-[#111933] border-[1px] border-gray-200 rounded-md pb-2">
    <p className="bg-[#111933] rounded-tl-md rounded-tr-md p-2 text-[#ffffff] text-lg font-normal">
      Proctoring Enabled
    </p>
    {[
      {
        title: "Full Screen Mode",
        value: testConfiguration?.fullScreenMode ? "Enabled" : "Disabled",
        enabled: testConfiguration?.fullScreenMode,
        icon: "fullscreen-icon", // Replace with appropriate icon class
      },
      {
        title: "Face Detection",
        value: testConfiguration?.faceDetection ? "Enabled" : "Disabled",
        enabled: testConfiguration?.faceDetection,
        icon: "face-detection-icon", // Replace with appropriate icon class
      },
      {
        title: "Device Restriction",
        value: testConfiguration?.deviceRestriction ? "Enabled" : "Disabled",
        enabled: testConfiguration?.deviceRestriction,
        icon: "device-restriction-icon", // Replace with appropriate icon class
      },
      {
        title: "Noise Detection",
        value: testConfiguration?.noiseDetection ? "Enabled" : "Disabled",
        enabled: testConfiguration?.noiseDetection,
        icon: "noise-detection-icon", // Replace with appropriate icon class
      },
    ].map((configParam) => (
      <div className="flex justify-between p-2 w-[85%] self-center">
        <p> {configParam.title} </p>{" "}
        <label className="relative inline-flex items-center cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={configParam.enabled}
            disabled
            className="sr-only peer"
          />
          <div className="w-10 h-5 cursor-auto bg-gray-300 rounded-full peer-focus:ring-2 peer-focus:ring-blue-900 peer-checked:bg-[#111933] transition-all duration-300">
            <div
              className={`absolute left-0.5 top-1 h-4 w-4 bg-white rounded-full shadow-md transition-transform duration-300 ${
                configParam.enabled ? "translate-x-5" : "translate-x-0"
              }`}
            ></div>
          </div>
        </label>
      </div>
    ))}
  </div>
</section>


        <RulesAndRegulations assessmentOverview={assessmentOverview} />
        {/* Visible To Section */}
        {student_details && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#111933] mb-4">
              Students
            </h2>

            {/* Filter Button */}
            <div className="flex justify-end">
              <button className="bg-[#111933] text-white font-medium mb-5 px-5 border rounded-xl"
                onClick={handleFilterDialogOpen}>
                <span className="pr-1">Filter</span><FilterListIcon />
              </button>
            </div>

            {/* Filter Dialog */}
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
                        backgroundColor: filters.year.includes(year)
                          ? "#111933"
                          : "rgba(225, 235, 255, 0.8)", // Light blue with low opacity
                        color: filters.year.includes(year) ? "#fff" : "#111933",
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
                    <IoCloseCircleOutline className="text-[#111933]"/>
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
                      backgroundColor: "#111933",
                    },
                  }}
                >
                  <div className="rounded-full border border-white ">
                    <FaCheckCircle className="text-white"/>
                  </div>
                  Apply Filters
                </Button>
              </DialogActions>
            </Dialog>

            {/* Filter Section */}
            <Box mb={2} display="flex" gap={2}>
              {/* Search Field */}
              <TextField
                label="Search"
                variant="outlined"
                fullWidth
                name="searchText"
                value={filters.searchText || ""}
                onChange={handleFilterChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '50px', // Fully rounded corners
                    height: '40px', // Reduced field height
                    padding: '0 16px', // Adjust padding for better alignment
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'gray', // Gray border color
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'darkgray', // Border color on hover
                  },
                  '& .MuiInputLabel-root': {
                    top: '-5px', // Adjust label alignment
                    fontSize: '0.9rem', // Smaller font for label
                    color: 'gray', // Gray label color
                  },
                  '& .MuiInputLabel-shrink': {
                    top: '0px', // Adjust shrink label position
                  },
                }}
              />

              {/* Filter by Year */}
              <TextField
                label="Filter by Year"
                select
                fullWidth
                name="year"
                value={filters.year || ""}
                onChange={handleFilterChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '50px', // Fully rounded corners
                    height: '40px', // Reduced field height
                    padding: '0 16px', // Adjust padding for better alignment
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'gray', // Gray border color
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'darkgray', // Border color on hover
                  },
                  '& .MuiInputLabel-root': {
                    top: '-5px', // Adjust label alignment
                    fontSize: '0.9rem', // Smaller font for label
                    color: 'gray', // Gray label color
                  },
                  '& .MuiInputLabel-shrink': {
                    top: '0px', // Adjust shrink label position
                  },
                }}
              >
                <MenuItem key={"All"} value={""}>
                  All
                </MenuItem>
                <MenuItem key={"I"} value={"I"}>
                  I
                </MenuItem>
                <MenuItem key={"II"} value={"II"}>
                  II
                </MenuItem>
                <MenuItem key={"III"} value={"III"}>
                  III
                </MenuItem>
                <MenuItem key={"IV"} value={"IV"}>
                  IV
                </MenuItem>
              </TextField>

              {/* Filter by Status */}
              <TextField
                label="Filter by Status"
                select
                fullWidth
                name="status"
                value={filters.status || ""}
                onChange={handleFilterChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '50px', // Fully rounded corners
                    height: '40px', // Reduced field height
                    padding: '0 16px', // Adjust padding for better alignment
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'gray', // Gray border color
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'darkgray', // Border color on hover
                  },
                  '& .MuiInputLabel-root': {
                    top: '-5px', // Adjust label alignment
                    fontSize: '0.9rem', // Smaller font for label
                    color: 'gray', // Gray label color
                  },
                  '& .MuiInputLabel-shrink': {
                    top: '0px', // Adjust shrink label position
                  },
                }}
              >
                <MenuItem key="All" value={""}>
                  All
                </MenuItem>
                <MenuItem key={"Completed"} value={"Completed"}>
                  Completed
                </MenuItem>
                <MenuItem key={"Started"} value={"Started"}>
                  Started
                </MenuItem>
                <MenuItem key={"Yet to Start"} value={"Yet to Start"}>
                  Yet to Start
                </MenuItem>
              </TextField>
            </Box>

            {/* Students Table */}
            <TableContainer component={Paper} sx={{ borderRadius: "10px" }}>
              <Table>
                <TableHead sx={{ backgroundColor: "#111933", color: "white" }}>
                  <TableRow>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "center",
                        padding: "15px 0px",
                      }}
                    >
                      <p className=" border-r-[1px] border-white w-full">
                        Name
                      </p>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "center",
                        padding: "15px 0px",
                      }}
                    >
                      <p className=" border-r-[1px] border-white w-full">
                        Registration Number
                      </p>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "center",
                        padding: "15px 0px",
                      }}
                    >
                      <p className=" border-r-[1px] border-white w-full">
                        Department
                      </p>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "center",
                        padding: "15px 0px",
                      }}
                    >
                      <p className=" border-r-[1px] border-white w-full">
                        College Name
                      </p>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "center",
                        padding: "15px 0px",
                      }}
                    >
                      <p className=" border-r-[1px] border-white w-full">
                        Year
                      </p>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "center",
                        padding: "15px 0px",
                      }}
                    >
                      <p className=" border-r-[1px] border-white w-full">
                        Status
                      </p>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        textAlign: "center",
                        padding: "15px 0px",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentStudents.map((student) => (
                    <TableRow key={student.regno}>
                      <TableCell sx={{ position: "relative", textAlign: "center" }}>
                        {isEditing && (
                          <button
                            onClick={() => handleStudentRemove(student.regno)}
                            style={{
                              position: "absolute",
                              left: "20px", // Adjust as needed
                              top: "50%",
                              transform: "translateY(-50%)",
                            }}
                          >
                            <XCircle className="text-red-500" />
                          </button>
                        )}
                        <span>{student.name}</span>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {student.regno}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {student.dept}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {student.collegename}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {student.year}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {student.status}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <button
                          className="text-red-500 ml-2"
                          onClick={() => handleViewClick(student)}
                        >
                          View
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filters.searchText === "" && (
              <div className="flex justify-center mt-6">
                <Pagination
                  count={Math.ceil(filteredStudents.length / rowsPerPage)}
                  page={page + 1} // Adjust page value to be one-based
                  onChange={handlePageChange}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#111933', // Text color for pagination items
                    },
                    '& .MuiPaginationItem-root.Mui-selected': {
                      backgroundColor: '#FDC500', // Background color for selected item
                      color: '#111933', // Text color for the selected item
                    },
                    '& .MuiPaginationItem-root:hover': {
                      backgroundColor: 'rgba(0, 9, 117, 0.1)', // Hover effect
                    },
                  }}
                />
              </div>
            )}

            <div className="flex justify-between items-stretch mt-6">
              {/* Add Student Button */}
              {isEditing && (
                <button
                  onClick={() => setPublishDialogOpen(true)}
                  className=" bg-[#111933] rounded-lg text-white px-4 py-2"
                >
                  Add Student
                </button>
              )}

              {isEditing && (
                <button
                  className={`bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center justify-center ${
                    loading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <div className="flex">
            {!isRegistrationPeriodOver && !isOverallStatusClosed && (
              <>
                <button
                  className={themeButtonStyle}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel" : "Edit"}
                </button>

                <button
                  className={themeButtonStyle}
                  onClick={() => {
                    setPopup("Are you sure you want to close the Assessment?");
                    setPopupFunction(() => handleCloseSession());
                    setShowPopup(true);
                  }}
                >
                  Close Assessment
                </button>
              </>
            )}
            <button
              className={themeButtonStyle}
              onClick={() => setShowDeletePopup(true)}
            >
              Delete Assessment
            </button>
            <button
              className={themeButtonStyle}
              onClick={() => setShowDownload(true)}
            >
              Download Contest Data
            </button>
          </div>

          <button className="px-7 p-1 rounded-lg bg-[#111933] border-[#111933] text-white border-[1px] mx-2 hover:bg-[#12204b] flex items-center" onClick={() => setShowPublishPopup(true)}>
            <span className="mr-2">Publish Assessment</span>
            <MdOutlinePublish />
          </button>
        </div>

        {/* Add Student Dialog */}
        <Dialog open={publishDialogOpen} onClose={() => setPublishDialogOpen(false)} fullWidth maxWidth="lg">
          <DialogTitle>Select Students</DialogTitle>
          <DialogContent>
            <StudentTable
              students={dialogStudents}
              selectedStudents={selectedStudents}
              setSelectedStudents={setSelectedStudents}
              filters={dialogFilters}
              setFilters={setDialogFilters}
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
              page={page}
              setPage={setPage}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              openFilterDialog={openFilterDialog}
              setOpenFilterDialog={setOpenFilterDialog}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPublishDialogOpen(false)} sx={{ color: "navy" }}>Cancel</Button>
            <Button onClick={handleAddStudent} sx={{ backgroundColor: "navy" }} variant="contained">
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* No Report Available Modal */}
        <Dialog open={modalOpen} onClose={handleCloseModal}>
          <DialogTitle className="font-semibold">
            No Report Available
          </DialogTitle>
          <DialogContent>
            <p>The report for this student is not available yet.</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>

        {/* Blur Background when Modal is Open */}
        {modalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm z-40"></div>
        )}

        {showDownload && (
          <DownloadContestData contestId={contestId} contestName={assessmentOverview?.name} />
        )}
      </div>
    </div>
  );
};

export default ViewTest;
