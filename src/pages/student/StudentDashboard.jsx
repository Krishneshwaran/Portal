import React, { useState, useEffect } from "react";
import { Tabs, Tab, Typography, Box, Container, Grid, Pagination } from "@mui/material";
import { styled } from "@mui/material";
import TestCard from "./TestCard";
import axios from "axios";
import NoExams from "../../assets/happy.png";
import backgroundImage from '../../assets/pattern.png';
import { useTestContext } from './TestContext';
import { SlBadge } from "react-icons/sl";
import Loader from '../../layout/Loader'; // Import the Loader component

// Keep existing styled components
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
  background: 'linear-gradient(135deg, rgb(139, 135, 251), rgb(95, 121, 214) 2%)',
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
    studentId: "",
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 9;
  const { setTestDetails } = useTestContext();

  const clearPreviousTestData = () => {
    // Clear specific test-related items from localStorage
    const testKeys = [
      'testDetails',
      'currentTest',
      'contestState',
    ];
    testKeys.forEach(key => localStorage.removeItem(key));
  };

  const fetchOpenTests = async (regno) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/student/tests?regno=${regno}`, {
        withCredentials: true,
      });

      return response.data.map((test) => {
        const { hours = "0", minutes = "0" } = test.testConfiguration?.duration || {};
        const duration = (parseInt(hours) * 3600) + (parseInt(minutes) * 60);
        const testConfig = {
          duration,
          fullScreenMode: test.testConfiguration?.fullScreenMode || false,
          faceDetection: test.testConfiguration?.faceDetection || false,
          deviceRestriction: test.testConfiguration?.deviceRestriction || false,
          noiseDetection: test.testConfiguration?.noiseDetection || false,
          fullScreenModeCount: test.testConfiguration?.fullScreenModeCount || 0,
          passPercentage: test.testConfiguration?.passPercentage || "0"
        };

        // Store in context
        setTestDetails(prev => ({
          ...prev,
          [test.contestId]: testConfig
        }));

        return {
          contestId: test.contestId,
          name: test.assessmentOverview?.name || "Unknown Test",
          description: test.assessmentOverview?.description || "No description available.",
          starttime: test.assessmentOverview?.registrationStart || "No Time",
          endtime: test.assessmentOverview?.registrationEnd || "No Time",
          problems: parseInt(test.testConfiguration?.questions, 10) || 0,
          assessment_type: "coding",
          duration: { hours, minutes }
        };
      }).reverse();
    } catch (error) {
      console.error("Error fetching open tests:", error);
      return [];
    }
  };

  const fetchMcqTests = async (regno) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/student/mcq-tests?regno=${regno}`, {
        withCredentials: true,
      });

      return response.data.map((test) => {
        const hours = test.testConfiguration?.duration?.hours || "0";
        const minutes = test.testConfiguration?.duration?.minutes || "0";
        const duration = (parseInt(hours) * 3600) + (parseInt(minutes) * 60);
        const testConfig = {
          duration,
          fullScreenMode: test.testConfiguration?.fullScreenMode || false,
          faceDetection: test.testConfiguration?.faceDetection || false,
          deviceRestriction: test.testConfiguration?.deviceRestriction || false,
          noiseDetection: test.testConfiguration?.noiseDetection || false,
          fullScreenModeCount: test.testConfiguration?.fullScreenModeCount || 0,
          faceDetectionCount: test.testConfiguration?.faceDetectionCount || 0,
          noiseDetectionCount: test.testConfiguration?.noiseDetectionCount || 0,
          passPercentage: test.testConfiguration?.passPercentage || "0",
          resultVisibility: test.testConfiguration?.resultVisibility || "Unknown"
        };

        // Store in context
        setTestDetails(prev => ({
          ...prev,
          [test._id]: testConfig
        }));

        return {
          testId: test._id,
          name: test.assessmentOverview?.name || "Unknown Test",
          description: test.assessmentOverview?.description || "No description available.",
          starttime: test.assessmentOverview?.registrationStart || "No Time",
          endtime: test.assessmentOverview?.registrationEnd || "No Time",
          questions: parseInt(test.testConfiguration?.questions || "0", 10),
          assessment_type: "mcq",
          duration: { hours, minutes },
          status: test.status || "Unknown",
        };
      }).reverse();
    } catch (error) {
      console.error("Error fetching MCQ tests:", error);
      return [];
    }
  };

  const fetchPublishStatus = async (testIds) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/student/check-publish-status/`,
        { testIds },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching publish status:", error);
      return {};
    }
  };

  const fetchStudentData = async () => {
    setIsLoading(true);
    try {
      clearPreviousTestData();

      const response = await axios.get(`${API_BASE_URL}/api/student/profile/`, {
        withCredentials: true,
      });
      
      const { name, regno, studentId, email } = response.data;
      setStudentData({ name, regno, studentId, email });
      
      localStorage.setItem('studentEmail', email);
      localStorage.setItem('studentName', name);
      localStorage.setItem('studentId', studentId);

      const [codingTests, mcqTestsData] = await Promise.all([
        fetchOpenTests(regno),
        fetchMcqTests(regno),
      ]);

      setOpenTests(codingTests);
      setMcqTests(mcqTestsData);

      // Fetch completion status
      const [codingReports, mcqReports] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/student/coding-reports/`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/student/mcq-reports/`, { withCredentials: true })
      ]);

      const completedCodingIds = new Set(
        codingReports.data
          .filter(report => report.status === "Completed")
          .map(report => report.contest_id)
      );

      const completedMcqIds = new Set(
        mcqReports.data
          .filter(report => report.status === "Completed")
          .map(report => report.contest_id)
      );

      const now = new Date();
      const allCompletedTests = [
        ...codingTests.filter(test => 
          completedCodingIds.has(test.contestId) || now > new Date(test.endtime)
        ),
        ...mcqTestsData.filter(test => 
          completedMcqIds.has(test.testId) || now > new Date(test.endtime)
        )
      ];

      const completedTestIds = allCompletedTests.map(test => test.contestId || test.testId);
      const publishStatus = await fetchPublishStatus(completedTestIds);

      setCompletedTests(
        allCompletedTests.map(test => ({
          ...test,
          ispublish: publishStatus[test.contestId || test.testId] || false
        }))
      );

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getPaginatedItems = (items) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  // Keep existing return JSX

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading && <Loader message="Fetching data..." />}
      <Container maxWidth="2xl" className="py-1 px-2 sm:px-4">
        <DashboardHeader className="bg-white mt-4 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImage})`}}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-blue p-6 rounded-full">
            <SlBadge className="h-20 w-20 text-[#111933]" />
            </div>
            <div>
              <Typography variant="h5" sx={{fontWeight:"800"}} className="text-[#111933]">
                Welcome back, {studentData.name}!
              </Typography>
              <Typography variant="h6" className="text-[#111933]">
                Registration Number: {studentData.regno}
              </Typography>
            </div>
          </div>
        </DashboardHeader>

        <Box className="bg-white rounded-xl shadow-sm p-4">
          <StyledTabs value={activeTab} onChange={handleTabChange}>
            <StyledTab label="Assigned to you"  />
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
                        No active assessments
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={Math.ceil((openTests.length + mcqTests.length) / itemsPerPage)}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              </>
            )}
            {activeTab === 1 && (
              <>
                <Typography variant="h6" className="font-bold text-gray-900 mb-7">
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
                        No completed assessments
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={Math.ceil(completedTests.length / itemsPerPage)}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
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