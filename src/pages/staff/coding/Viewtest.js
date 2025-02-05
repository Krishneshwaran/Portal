import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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
  Checkbox,
  TablePagination,
  Paper,
  Box,
  Menu,
  MenuItem,
  Pagination,
} from "@mui/material";
import { parseISO, isAfter } from 'date-fns';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
//img imports
import heroImg from "../../../assets/test_view_hero_img.png";
import StudentTable from "../../../components/staff/StudentTable";
import Loader from "../../../layout/Loader"; // Import the Loader component
import { XCircle } from 'lucide-react';

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

const textFieldStyle = {
  borderRadius: '80px', // Rounded corners
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#6267e8', // Default border color
    },
    '&:hover fieldset': {
      borderColor: '#6267e8', // Hover border color
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6267e8', // Focus border color
      borderWidth: 2,
    },
  },
};

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
        <p className="text-2xl font-semibold text-[#00296B] mb-2">
          {" "}
          Rules and Regulations{" "}
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
    "px-5 p-2 rounded-full bg-[#FFCC0061] border-[#FFCC00] border-[1px] mx-2 hover:bg-[#FFCC0090]";

  const studentsPerPage = 5;

  const { contestId } = useParams();
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const [popup, setPopup] = useState("some popup message");
  const [showPopup, setShowPopup] = useState(false);
  const [popupFunction, setPopupFunction] = useState();
  const [page, setPage] = useState(0); // Ensure pagination starts at page 0

  const paginate = (pageNumber) => setPage(pageNumber);
  const navigate = useNavigate(); // Used for navigation
  const [testDetails, setTestDetails] = useState(null);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filters, setFilters] = useState({
    collegename: "",
    dept: "",
    year: "",
    status: "",
    searchText: "",
  }); // Extended filters
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [dialogStudents, setDialogStudents] = useState([]); // To store all students for the dialog
  const [dialogFilters, setDialogFilters] = useState({
    collegename: "",
    dept: "",
    year: "",
  });
  const [filteredDialogStudents, setFilteredDialogStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Set rowsPerPage to 10
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
  const [isPublishing, setIsPublishing] = useState(false); // Button disable state
  const [isPublished, setIsPublished] = useState(false); // Result published state
  const [downloadAnchorEl, setDownloadAnchorEl] = useState(null); // To manage download menu
  const [studentReports, setStudentReports] = useState({}); // To store correct answers for students
  const [loading, setLoading] = useState(true); // Set initial loading state to true
  const [modalOpen, setModalOpen] = useState(false); // State to manage modal
  const [startedModalOpen, setStartedModalOpen] = useState(false); // State to manage modal for "Started" status

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
      setIsPublishing(true); // Disable button during API call

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
      setIsPublishing(false); // Re-enable the button
    }
  };

  const handleDownloadAll = () => {
    // Ensure student data is available
    if (
      !testDetails?.student_details ||
      testDetails.student_details.length === 0
    ) {
      toast.error("No student data available to download");
      return;
    }

    // Create CSV
    const headers = [
      "Name",
      "Registration Number",
      "Department",
      "College Name",
      "Year",
      "Status",
      "Correct Answers",
    ];

    const csvContent = [
      headers.join(","),
      ...testDetails.student_details.map((student) =>
        [
          `"${student.name || ""}"`,
          `"${student.regno || ""}"`,
          `"${student.dept || ""}"`,
          `"${student.collegename || ""}"`,
          `"${student.year || ""}"`,
          `"${student.status || ""}"`,
          `"${studentReports[student.regno] || "N/A"}"`,
        ].join(",")
      ),
    ].join("\n");

    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `all_students_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadByStatus = (status) => {
    const filteredData = testDetails?.student_details.filter(
      (student) => student.status.toLowerCase() === status.toLowerCase()
    );

    if (filteredData.length === 0) {
      toast.error(`No students found with status: ${status}`);
      return;
    }

    const headers = [
      "Name",
      "Registration Number",
      "Department",
      "College Name",
      "Year",
      "Status",
      "Correct Answers",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredData.map((student) =>
        [
          `"${student.name || ""}"`,
          `"${student.regno || ""}"`,
          `"${student.dept || ""}"`,
          `"${student.collegename || ""}"`,
          `"${student.year || ""}"`,
          `"${student.status || ""}"`,
          `"${studentReports[student.regno] || "N/A"}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `students_${status.toLowerCase().replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Fetch Test Details
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
  }, [contestId]);

  // Fetch All Students
  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/student/`);
      const updatedStudents = response.data.map((student) => ({
        ...student,
        year: student.year || "N/A", // Ensure year always has a value
      }));
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/student/`);
        const updatedStudents = response.data.map((student) => ({
          ...student,
          year: student.year || "N/A",
          status: student.status || "Unknown",
        }));
        setDialogStudents(updatedStudents); // Set the data for the dialog
        setFilteredDialogStudents(updatedStudents); // Initialize the filtered data
      } catch (error) {
        console.error("Failed to fetch all students:", error);
      }
    };

    if (publishDialogOpen) fetchAllStudents();
  }, [publishDialogOpen]);

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

      // Filter by Year
      if (filters.year) {
        filtered = filtered.filter((student) => student.year === filters.year);
      }

      // Search Text Filter (only for student name)
      if (filters.searchText) {
        filtered = filtered.filter((student) =>
          student.name.toLowerCase().includes(filters.searchText.toLowerCase())
        );
      }

      setFilteredStudents(filtered);
      setPage(0); // Reset to the first page when filters change
    };

    applyFilters();
  }, [filters, students]);

  useEffect(() => {
    const applyDialogFilters = () => {
      let filtered = [...dialogStudents]; // Define filtered variable

      // Filter by College Name
      if (dialogFilters.collegename) {
        filtered = filtered.filter((student) =>
          student.collegename
            .toLowerCase()
            .includes(dialogFilters.collegename.toLowerCase())
        );
      }

      // Filter by Department
      if (dialogFilters.dept) {
        filtered = filtered.filter((student) =>
          student.dept.toLowerCase().includes(dialogFilters.dept.toLowerCase())
        );
      }

      // Filter by Year
      if (dialogFilters.year) {
        filtered = filtered.filter(
          (student) => student.year === dialogFilters.year
        );
      }

      setFilteredDialogStudents(filtered);
    };

    applyDialogFilters();
  }, [dialogFilters, dialogStudents]);

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

  const handleDeleteStudent = (index) => {
    setTestDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails };
      updatedDetails.visible_to.splice(index, 1);
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
    visible_to,
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
              className="px-5 p-2 rounded-lg flex-1 bg-[#00296B61] border-[#00296B] border-[1px] hover:bg-[#00296B90]"
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
      <div className="p-6 bg-gray-100 min-h-full">
        {/* Previous Page Button
      <div className="mb-4 flex flex-row justify-between items-center">
        <Button
          variant="outlined"
          color="primary"
          onClick={handleGoToStaffDashboard}
          startIcon={<span>&larr;</span>} // Add a left arrow icon
          className="px-4 py-2 rounded-full"
          sx={{ borderRadius: "24px", textTransform: "none" }}
        >
          Back
        </Button>

      </div> */}
        {/* Header Section */}
        <section className="flex p-6 shadow-sm flex-1 bg-white mb-6 rounded-lg text-[#00296B] items-start">
          {/* details */}
          <div className="flex-1 flex flex-col mr-12 justify-between">
            <div className="mb-6">
              <p className="text-2xl font-semibold mb-2">
                {assessmentOverview?.name}{" "}
              </p>
              <p className="text-sm text-black break-words text-justify">
                {assessmentOverview?.description}
              </p>
            </div>

            <div className="mt-4">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr>
                    {[
                      "Registration Start",
                      "Registration End",
                      "Total Duration",
                      "Total Attendees",
                    ].map((title, index) => (
                      <th key={index} className="py-2 px-4 border-b">
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-center">
                    <td className="py-2 px-4 border-b">
                      {formatDateTime(assessmentOverview?.registrationStart)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {formatDateTime(assessmentOverview?.registrationEnd)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {`${testConfiguration?.duration?.hours}:${testConfiguration?.duration?.minutes} hrs`}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {student_details?.length || 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* hero img */}
          <img src={heroImg} className="w-[200px] ml-1 lg:w-[250px]" />
        </section>

        {/* Test Configuration Section
      {testConfiguration && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Test Configuration</h2>
          <div>
            <strong>Questions:</strong> {testConfiguration?.questions}
          </div>
          <div>
            <strong>Duration:</strong> {testConfiguration?.duration?.hours}{" "}
            hours {testConfiguration?.duration?.minutes} minutes
          </div>
          <div>
            <strong>Full Screen Mode:</strong>{" "}
            {testConfiguration?.fullScreenMode ? "Enabled" : "Disabled"}
          </div>
          <div>
            <strong>Face Detection:</strong>{" "}
            {testConfiguration?.faceDetection ? "Enabled" : "Disabled"}
          </div>
          <div>
            <strong>Device Restriction:</strong>{" "}
            {testConfiguration?.deviceRestriction ? "Enabled" : "Disabled"}
          </div>
          <div>
            <strong>Noise Detection:</strong>{" "}
            {testConfiguration?.noiseDetection ? "Enabled" : "Disabled"}
          </div>
          <div>
            <strong>Pass Percentage:</strong>{" "}
            {testConfiguration?.passPercentage}%
          </div>
        </div>
      )} */}

        <section className="flex space-x-6 flex-1 mb-6">
          {/* Questions & Section Details */}
          <div className="flex-1 flex flex-col text-center bg-white text-[#00296B] border-[1px] border-gray-200 rounded-md pb-2">
            <p className="bg-[#ffcc005f] rounded-tl-md rounded-tr-md p-2 text-[#000975] text-lg font-semibold">
              Questions & Section Details
            </p>
            <div className="flex flex-col space-y-1 p-4">
              <div className="flex items-center">
                <i className="bi bi-question-circle text-sm font-bold"></i>{" "}
                <p className="font-semibold ml-1">No.of.Questions</p>:{" "}
                <p>{testConfiguration?.questions || 0}</p>
              </div>
              {sections?.length > 0 && (
                <div className="flex items-center">
                  <i className="bi bi-grid-1x2 text-sm font-bold"></i>{" "}
                  <p className="font-semibold ml-1">No.of.Sections</p>:{" "}
                  <p>{sections?.length || 0}</p>
                </div>
              )}
              <div className="flex items-center">
                <i className="bi bi-clipboard-data text-sm font-bold"></i>{" "}
                <p className="font-semibold ml-1">Total Marks</p>:{" "}
                <p>{testConfiguration?.totalMarks || 0}</p>
              </div>
            </div>
          </div>

          {/* Sections & Questions Table */}
          <div className="flex-1 flex flex-col text-center bg-white text-[#00296B] border-[1px] border-gray-200 rounded-md pb-2">
            <p className="bg-[#ffcc005f] rounded-tl-md rounded-tr-md p-2 text-[#000975] text-lg font-semibold">
              Sections & Questions
            </p>
            <div className="grid grid-cols-2 items-center font-semibold p-4">
              <p className="text-center p-2 border-r-[1px] border-[#00296b] border-b-[1px]">
                Sections
              </p>
              <p className="text-center p-2 border-b-[1px] border-[#00296b]">
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
                    <p className="text-center border-r-[1px] border-[#00296b] border-b-[1px] flex items-center justify-center p-2">
                      {section.sectionName}
                    </p>
                    <p className="text-center border-b-[1px] border-[#00296b] flex items-center justify-center p-2">
                      {section.numQuestions}
                    </p>
                  </div>
                ))}
                <div className="grid grid-cols-2 flex-1 items-stretch">
                  <p className="text-center border-r-[1px] border-[#00296b] flex items-center justify-center p-2">
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
          <div className="flex-1 flex flex-col text-center bg-white text-[#00296B] border-[1px] border-gray-200 rounded-md pb-2">
            <p className="bg-[#ffcc005f] rounded-tl-md rounded-tr-md p-2 text-[#000975] text-lg font-semibold">
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
                  <div className="w-10 h-5 cursor-auto bg-gray-300 rounded-full peer-focus:ring-2 peer-focus:ring-amber-400 peer-checked:bg-amber-400 transition-all duration-300">
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
            <h2 className="text-xl font-semibold text-[#00296B] mb-4">
              Students
            </h2>

            {/* <div className="mb-4 flex gap-2">
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadAll}
            >
              Download All
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={(e) => setDownloadAnchorEl(e.currentTarget)}
            >
              Download by Status
            </Button>

            <Menu
              anchorEl={downloadAnchorEl}
              open={Boolean(downloadAnchorEl)}
              onClose={() => setDownloadAnchorEl(null)}
            >
              <MenuItem onClick={() => handleDownloadByStatus("Completed")}>
                Download Completed
              </MenuItem>
              <MenuItem onClick={() => handleDownloadByStatus("Started")}>
                Download Started
              </MenuItem>
              <MenuItem onClick={() => handleDownloadByStatus("Yet to Start")}>
                Download Yet to Start
              </MenuItem>
            </Menu>
          </div> */}

            {/* Filter Section */}
            <Box mb={2} display="flex" gap={2}>
              <TextField
                label="Search"
                variant="outlined"
                fullWidth
                name="searchText"
                value={filters.searchText || ""}
                onChange={handleFilterChange}
                sx={textFieldStyle}
              />
              <TextField
                label="Filter by Year"
                select
                defaultValue="All"
                fullWidth
                name="year"
                value={filters.year || ""}
                onChange={handleFilterChange}
                sx={textFieldStyle}
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
              <TextField
                label="Filter by Status"
                select
                defaultValue="All"
                fullWidth
                name="status"
                value={filters.status || ""}
                onChange={handleFilterChange}
                sx={textFieldStyle}
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
                <TableHead sx={{ backgroundColor: "#00296B", color: "white" }}>
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
                    {!isEditing && (
                      <TableCell
                        sx={{
                          color: "white",
                          textAlign: "center",
                          padding: "15px 0px",
                        }}
                      >
                        Actions
                      </TableCell>
                    )}
                    {isEditing && (
                      <TableCell
                        sx={{
                          color: "white",
                          textAlign: "center",
                          padding: "15px 0px",
                        }}
                      >
                        Actions
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentStudents.map((student) => (
                    <TableRow key={student.regno}>
                      <TableCell sx={{ position: "relative", textAlign: "center" }}>
                      {isEditing && (
                        <button
                          onClick={() => handleDeleteStudent(student.regno)}
                          style={{
                            position: "absolute",
                            left: "20px", // Adjust as needed
                            top: "50%",
                            transform: "translateY(-50%)"
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
            )}

            <div className="flex justify-between items-stretch mt-6">
              {/* Add Student Button */}
              {isEditing && (
                <button
                  onClick={() => setPublishDialogOpen(true)}
                  className=" bg-[#00296b] rounded-lg text-white px-4 py-2"
                >
                  Add Student
                </button>
              )}

              {isEditing && (
                <button
                  className={`bg-green-500 text-white px-4 py-2 rounded-lg flex items-center justify-center ${
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
                    setPopupFunction((prevfunction) => () => handleCloseSession());
                    setShowPopup(true);
                  }}
                >
                  Close Assessment
                </button>
              </>
            )}
            <button
              className={themeButtonStyle}
              onClick={() => {
                setPopup("Are you sure you want to delete the Assessment?");
                setPopupFunction((prevfunction) => () => handleDeleteContest());
                setShowPopup(true);
              }}
            >
              Delete Assessment
            </button>
          </div>

          <button className={themeButtonStyle} onClick={handlePublish}>
            Publish Assessment
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
              filters={filters}
              setFilters={setFilters}
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
        {(modalOpen || startedModalOpen) && (
          <div className="fixed inset-0 backdrop-blur-sm z-40"></div>
        )}
      </div>
    </div>
  );
};

export default ViewTest;
