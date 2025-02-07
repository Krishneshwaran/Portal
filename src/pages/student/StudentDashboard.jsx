import React, { useState, useEffect } from "react";
import { Tabs, Tab, Typography, Box, Container, Grid, Pagination } from "@mui/material";
import { styled } from "@mui/material";
import TestCard from "./TestCard";
import axios from "axios";
import NoExams from "../../assets/happy.png";
import { Award } from 'lucide-react';
import backgroundImage from '../../assets/pattern.png';
import { useTestContext } from './TestContext';
import Loader from '../../layout/Loader'; // Import the Loader component

const StyledTabs = styled(Tabs)({
  backgroundColor: '#ffff',
  borderRadius: '8px',
  '& .MuiTabs-indicator': {
    backgroundColor: '#2563eb',
    height: '3px',
    borderRadius: '3px',
  },
});

const StyledTab = styled(Tab)({
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: '600',
  color: '#64748b',
  padding: '12px 24px',
  '&.Mui-selected': {
    color: '#2563eb',
  },
  '&:hover': {
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
  },
});

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const DashboardHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgb(139, 135, 251), rgb(95, 121, 214) 2%%)',
  borderRadius: '16px',
  padding: '32px',
  marginBottom: '32px',
  color: 'blue',
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
    marginBottom: '16px',
  },
}));

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openTests, setOpenTests] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [mcqTests, setMcqTests] = useState([]);
  const [studentData, setStudentData] = useState({
    name: "",
    regno: "",
    email: "",
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true); // State to manage loading
  const itemsPerPage = 9;

  const fetchStudentData = async () => {
    setIsLoading(true); // Set loading to true before fetching data
    try {
      const response = await axios.get(`${API_BASE_URL}/api/student/profile/`, {
        withCredentials: true,
      });
      const { name, regno, studentId, email } = response.data;
      setStudentData({ name, regno, studentId, email });

      localStorage.setItem('studentEmail', email);
      localStorage.setItem('studentName', name);

      const [openTestsData, mcqTestsData, codingReportsData, mcqReportsData] = await Promise.all([
        fetchOpenTests(regno),
        fetchMcqTests(regno),
        fetchCodingReports(),
        fetchMcqReports(),
      ]);

      const completedContestIds = new Set(codingReportsData.filter(report => report.status === "Completed").map(report => report.contest_id));
      const completedMcqTestIds = new Set(mcqReportsData.filter(report => report.status === "Completed").map(report => report.contest_id));
      const now = new Date();

      const allCompletedTests = [
        ...openTestsData.filter(test => completedContestIds.has(test.contestId) || now > new Date(test.endtime)),
        ...mcqTestsData.filter(test => completedMcqTestIds.has(test.testId) || now > new Date(test.endtime))
      ];

      const completedTestIds = allCompletedTests.map(test => test.contestId || test.testId);
      const publishStatusResponse = await fetchPublishStatus(completedTestIds);

      const completedTestsWithPublishStatus = allCompletedTests.map(test => {
        const testId = test.contestId || test.testId;
        return { ...test, ispublish: publishStatusResponse[testId] || false };
      });

      const ongoingCodingTests = openTestsData.filter(test => !completedContestIds.has(test.contestId) && now <= new Date(test.endtime));
      const ongoingMcqTests = mcqTestsData.filter(test => !completedMcqTestIds.has(test.testId) && now <= new Date(test.endtime));

      setOpenTests(ongoingCodingTests);
      setMcqTests(ongoingMcqTests);
      setCompletedTests(completedTestsWithPublishStatus);
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setIsLoading(false); // Set loading to false after data is fetched
    }
  };

  const fetchPublishStatus = async (testIds) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/student/check-publish-status/`, { testIds }, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching publish status:", error);
      return {};
    }
  };

  const fetchOpenTests = async (regno) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/student/tests?regno=${regno}`, {
        withCredentials: true,
      });

      const formattedTests = response.data.map((test) => {
        const { hours, minutes } = test.testConfiguration.duration;
        const duration = (parseInt(hours) * 3600) + (parseInt(minutes) * 60);
        const fullScreenMode = test.testConfiguration.fullScreenMode;
        const faceDetection = test.testConfiguration.faceDetection;
        const deviceRestriction = test.testConfiguration.deviceRestriction;
        const noiseDetection = test.testConfiguration.noiseDetection;
        const fullScreenModeCount = test.testConfiguration.fullScreenModeCount; // Add noiseDetection
        const passPercentage = test.testConfiguration?.passPercentage || "0";

        localStorage.setItem(`testDuration_${test.contestId}`, duration);
        localStorage.setItem(`fullScreenMode_${test.contestId}`, fullScreenMode);
        localStorage.setItem(`faceDetection_${test.contestId}`, faceDetection);
        localStorage.setItem(`deviceRestriction_${test.contestId}`, deviceRestriction);
        localStorage.setItem(`noiseDetection_${test.contestId}`, noiseDetection);
        localStorage.setItem(`fullScreenModeCount_${test.contestID}`,fullScreenModeCount); // Set noiseDetection in localStorage
        localStorage.setItem(`passPercentage_${test._id}`, passPercentage);

        return {
          contestId: test.contestId,
          name: test.assessmentOverview?.name || "Unknown Test",
          description: test.assessmentOverview?.description || "No description available.",
          starttime: test.assessmentOverview?.registrationStart || "No Time",
          endtime: test.assessmentOverview?.registrationEnd || "No Time",
          problems: parseInt(test.testConfiguration?.questions, 10) || 0,
          assessment_type: "coding",
        };
      }).reverse(); // Reverse the order of the tests

      return formattedTests;
    } catch (error) {
      console.error("Error fetching open tests:", error);
      return [];
    }
  };
  const { testDetails, setTestDetails } = useTestContext();
  const fetchMcqTests = async (regno) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/student/mcq-tests?regno=${regno}`, {
        withCredentials: true,
      });

      const formattedTests = response.data.map((test) => {
        const durationConfig = test.testConfiguration?.duration;
        const hours = parseInt(durationConfig?.hours || "0", 10);
        const minutes = parseInt(durationConfig?.minutes || "0", 10);
        const duration = (hours * 3600) + (minutes * 60);

        const fullScreenMode = test.testConfiguration?.fullScreenMode || false;
        const faceDetection = test.testConfiguration?.faceDetection || false;
        const deviceRestriction = test.testConfiguration?.deviceRestriction || false;
        const noiseDetection = test.testConfiguration?.noiseDetection || false; // Add noiseDetection
        const fullScreenModeCount = test.testConfiguration?.fullScreenModeCount || 0; // Add fullScreenModeCount
        const faceDetectionCount = test.testConfiguration?.faceDetectionCount || 0; // Add faceDetectionCount
        const noiseDetectionCount = test.testConfiguration?.noiseDetectionCount || 0; // Add noiseDetectionCount
        const passPercentage = test.testConfiguration?.passPercentage || "0";

        const resultVisibility = test.testConfiguration?.resultVisibility || "Unknown";

        if (test.testConfiguration) {
          setTestDetails(prevState => ({
            ...prevState,
            [test._id]: {
              duration,
              fullScreenMode,
              faceDetection,
              deviceRestriction,
              noiseDetection,
              resultVisibility,
              fullScreenModeCount,
              faceDetectionCount,
              noiseDetectionCount,
              passPercentage
            }
          }));
        }

        return {
          testId: test._id,
          name: test.assessmentOverview?.name || "Unknown Test",
          description: test.assessmentOverview?.description || "No description available.",
          starttime: test.assessmentOverview?.registrationStart || "No Time",
          endtime: test.assessmentOverview?.registrationEnd || "No Time",
          questions: parseInt(test.testConfiguration?.questions || "0", 10),
          assessment_type: "mcq",
          duration: test.testConfiguration?.duration,
          status: test.status || "Unknown",
        };
      }).reverse();

      return formattedTests;
    } catch (error) {
      console.error("Error fetching MCQ tests:", error);
      return [];
    }
  };

  const fetchCodingReports = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/student/coding-reports/`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching coding reports:", error);
      return [];
    }
  };

  const fetchMcqReports = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/student/mcq-reports/`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching MCQ reports:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  useEffect(() => {
    const hasRefreshed = localStorage.getItem("hasRefreshed");

    if (!hasRefreshed) {
      const timer = setTimeout(() => {
        // Set the flag in localStorage to indicate the page has been refreshed
        localStorage.setItem("hasRefreshed", "true");
        // Reload the page
        window.location.reload();
      }, 1500); // 1.5 seconds delay

      return () => clearTimeout(timer); // Cleanup the timer on component unmount
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1); // Reset page to 1 when tab changes
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getPaginatedItems = (items) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading && <Loader message="Fetching data..." />} {/* Show loader if isLoading is true */}
      <Container maxWidth="2xl" className="py-1 px-2 sm:px-4">
        <DashboardHeader className="bg-white mt-4 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImage})`}}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-blue p-2 rounded-full">
              <Award className="h-10 w-10 bg-blue" />
            </div>
            <div>
              <Typography variant="h5" className="font-bold text-[#000975]">
                Welcome back, {studentData.name}!
              </Typography>
              <Typography variant="h6" className="text-gray-500">
                Registration Number: {studentData.regno}
              </Typography>
            </div>
          </div>
        </DashboardHeader>

        <Box className="bg-white rounded-xl shadow-sm p-4">
          <StyledTabs value={activeTab} onChange={handleTabChange}>
            <StyledTab label="Assigned to you" />
            <StyledTab label="Completed/Closed" />
          </StyledTabs>

          <Box className="mt-6">
            {activeTab === 0 && (
              <>
                <Typography variant="h6" className="font-bold text-gray-900 mb-7">
                  Active Assessments
                </Typography>
                <Grid container spacing={2}>
                  {getPaginatedItems([...openTests, ...mcqTests]).map((test) => (
                    <Grid item xs={12} sm={6} md={4} key={test.contestId || test.testId}>
                      <TestCard
                        test={test}
                        assessment_type={test.assessment_type}
                        isCompleted={false}
                        testDetails={testDetails[test.testId]} // Pass test details securely
                      />
                    </Grid>
                  ))}
                  {openTests.length === 0 && mcqTests.length === 0 && (
                    <Box className="col-span-3 text-center py-12">
                      <img
                        src={NoExams}
                        alt="No Exams"
                        className="mx-auto mb-6 w-48 h-48"
                      />
                      <Typography variant="h6" className="font-medium text-gray-900">
                        Enjoy your free time!
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={Math.ceil((openTests.length + mcqTests.length) / itemsPerPage)}
                    page={page}
                    onChange={handlePageChange}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: '#000975', // Text color for pagination items
                      },
                      '& .MuiPaginationItem-root.Mui-selected': {
                        backgroundColor: '#000975', // Background color for selected item
                        color: '#fff', // Text color for the selected item
                      },
                      '& .MuiPaginationItem-root:hover': {
                        backgroundColor: 'rgba(0, 9, 117, 0.1)', // Hover effect
                      },
                    }}
                  />
                </Box>
              </>
            )}
            {activeTab === 1 && (
              <>
                <Typography variant="h6" className="font-bold text-gray-900 mb-4">
                  Completed Assessments
                </Typography>
                <Grid container spacing={2}>
                  {getPaginatedItems(completedTests).map((test) => (
                    <Grid item xs={12} sm={6} md={4} key={test.contestId || test.testId}>
                      <TestCard
                        test={test}
                        assessment_type={test.assessment_type}
                        isCompleted={true}
                        studentId={studentData.studentId}
                        isPublished={test.ispublish}
                      />
                    </Grid>
                  ))}
                  {completedTests.length === 0 && (
                    <Box className="col-span-3 text-center py-12">
                      <img
                        src={NoExams}
                        alt="No Exams"
                        className="mx-auto mb-6 w-48 h-48"
                      />
                      <Typography variant="h6" className="font-medium text-gray-900">
                        No completed assessments yet
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={Math.ceil(completedTests.length / itemsPerPage)}
                    page={page}
                    onChange={handlePageChange}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: '#000975', // Text color for pagination items
                      },
                      '& .MuiPaginationItem-root.Mui-selected': {
                        backgroundColor: '#000975', // Background color for selected item
                        color: '#fff', // Text color for the selected item
                      },
                      '& .MuiPaginationItem-root:hover': {
                        backgroundColor: 'rgba(0, 9, 117, 0.1)', // Hover effect
                      },
                    }}
                  />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default StudentDashboard;