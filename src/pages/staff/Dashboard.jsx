import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaChartBar, FaUsers, FaClipboardList, FaCheckCircle, FaSearch } from 'react-icons/fa';
import { Dialog, DialogTitle, DialogContent, IconButton, DialogActions, Typography, Grid, Box, Pagination } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StatsCard from '../../components/staff/StatsCard';
import TestCard from '../../components/staff/TestCard';
import CreateTestCard from '../../components/staff/CreaTestCard';
import Loader from '../../layout/Loader';
import mcq from '../../assets/mcq.png';
import code from '../../assets/code.png';
import api from '../../axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, utcToZonedTime } from 'date-fns-tz';
import { formatInTimeZone } from 'date-fns-tz';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import notest from '../../assets/testno.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    totalTests: 0,
    students: 0,
    liveTests: 0,
    completedTests: 0,
    upcomingTest: 0,
  });

  const [tests, setTests] = useState([]);
  const [mcqTests, setMcqTests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [clickCount, setClickCount] = useState(0);
  const [showToggle, setShowToggle] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [contestResponse, studentStatsResponse, mcqResponse] = await Promise.all([
        api.get('/contests', { withCredentials: true }),
        api.get('/students/stats', { withCredentials: true }),
        api.get('/mcq', { withCredentials: true }),
      ]);

      const codingTests = contestResponse?.data?.contests || [];
      const mcqAssessments = mcqResponse?.data?.assessments || [];

      const reversedCodingTests = [...codingTests].reverse();
      const reversedMcqTests = [...mcqAssessments].reverse();

      const totalTests = codingTests.length + mcqAssessments.length;
      const liveTests = [...codingTests, ...mcqAssessments].filter((test) => test.status === 'Live').length;
      const completedTests = [...codingTests, ...mcqAssessments].filter(
        (test) => test.status === 'Completed' ||
                  test.status === 'Closed' ||
                  test.overall_status === 'closed' ||
                  (test.testEndDate && new Date(test.testEndDate) < new Date())
      ).length;
      const upcomingTests = [...codingTests, ...mcqAssessments].filter(
        (test) => test.status === 'Upcoming'
      ).length;

      setStats({
        totalTests,
        students: studentStatsResponse?.data?.total_students || 0,
        liveTests,
        completedTests,
        upcomingTest: upcomingTests,
      });

      setTests(reversedCodingTests);
      setMcqTests(reversedMcqTests);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch test data. Please try again later.');
      toast.error('Failed to fetch test data. Please try again later.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate('/stafflogin');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const state = location.state;
    if (state && state.testStatus === 'closed') {
      fetchData(); // Re-fetch data when closed assessment is detected
    }
  }, [location, fetchData]);

  // Filter tests based on status and search query
  const filteredTests = useMemo(() => {
    const allTests = [...tests, ...mcqTests];
    if (activeFilter === 'All') {
      return allTests.filter((test) =>
        (test.assessmentName || test.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return allTests.filter(
      (test) => test.status === activeFilter && (test.assessmentName || test.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tests, mcqTests, activeFilter, searchQuery]);

  // Modify itemsPerPage to be dynamic based on activeFilter
  const getItemsPerPage = useCallback(() => {
    return activeFilter === 'All' ? 8 : 9;
  }, [activeFilter]);

  // Update paginatedTests to use dynamic itemsPerPage
  const paginatedTests = useMemo(() => {
    const currentItemsPerPage = getItemsPerPage();
    return filteredTests.slice((page - 1) * currentItemsPerPage, page * currentItemsPerPage);
  }, [filteredTests, page, getItemsPerPage]);

  // Handle filter change
  const filterTests = useCallback((status) => {
    setActiveFilter(status);
    setPage(1); // Reset to the first page when filter changes
  }, []);

  // Handle modal open/close
  const handleModalClose = () => setIsModalOpen(false);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to the first page when search query changes
  };

  // Update handlePageChange to use dynamic itemsPerPage
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  useEffect(() => {
    const state = location.state;
    if (state && state.toastMessage) {
      toast.success(state.toastMessage);
      // Clear the state to prevent repeated toasts
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleOverallStatsClick = () => {
    setClickCount((prevCount) => {
      const newCount = prevCount + 1;
      if (newCount === 15) {
        setShowToggle(true);
      }
      return newCount;
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#f4f6ff86]'}`}>
      {/* Toast Container */}
      <ToastContainer />

      {/* Header Section */}
      <div className={`bg-transparent mx-5 ml-16 mr-14 rounded-b-2xl p-6 mb-2 ${isDarkMode ? 'text-white' : ''}`}>
        <h2
          className={`text-3xl ${isDarkMode ? 'text-white' : 'text-[#000975]'} mb-6 font-medium cursor-pointer`}
          onClick={handleOverallStatsClick}
        >
          Overall Stats
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-3">
          <StatsCard icon={<FaChartBar />} title="Total Tests" value={stats.totalTests} isDarkMode={isDarkMode} />
          <StatsCard icon={<FaUsers />} title="No of Students" value={stats.students} isDarkMode={isDarkMode} />
          <StatsCard icon={<FaClipboardList />} title="No of Live Test" value={stats.liveTests} isDarkMode={isDarkMode} />
          <StatsCard icon={<FaCheckCircle />} title="No of Completed Test" value={stats.completedTests} isDarkMode={isDarkMode} />
          <StatsCard icon={<FaCheckCircle />} title="No of Upcoming Test" value={stats.upcomingTest} isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Main Content Section */}
      <div className={`max-w-8xl mx-auto px-4 py-8 ${isDarkMode ? 'text-white' : ''}`}>
        {/* Tabs, Search, and Create Test Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex text-sm gap-4 ml-20">
            {['All', 'Live', 'Completed', 'Upcoming'].map((status) => (
              <button
                key={status}
                className={`px-4 rounded-[10000px] py-1 ${
                  activeFilter === status ? 'bg-[#000975] text-white font-bold' : 'text-gray-600 hover:text-gray-900'
                } ${isDarkMode ? 'text-white' : ''}`}
                onClick={() => filterTests(status)}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative mr-16">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              className={`px-10 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400 w-full ring-1 ring-blue-400 ${isDarkMode ? 'bg-gray-800 text-white' : ''}`}
            />
          </div>
        </div>

        {/* Tests Section */}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <div className={`grid  rounded-2xl grid-cols-1 md:grid-cols-3 p-7 ml-14 mr-12 gap-6 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
              {activeFilter === 'All' && searchQuery === '' && <CreateTestCard />}
              {paginatedTests.length > 0 ? (
                paginatedTests.map((test) => (
                  <TestCard
                    key={test._id}
                    contestId={test.contestId || test._id}
                    title={test.assessmentName || test.name || 'Unnamed Test'}
                    type={test.type || 'General'}
                    date={test.endDate ? format(new Date(test.endDate), 'MM/dd/yyyy') : 'Date Unavailable'}
                    time={
                      test.endDate
                        ? formatInTimeZone(new Date(test.endDate), 'UTC', 'hh:mm a')
                        : 'Time Unavailable'
                    }
                    stats={{
                      Assigned: test.assignedCount || 0,
                      'Yet to Complete': (test.assignedCount || 0) - (test.completedCount || 0),
                      Completed: test.completedCount || 0,
                    }}
                    status={
                      test.overall_status === 'closed' ? 'Completed' :
                      (test.status || 'Upcoming')
                    }
                    isDarkMode={isDarkMode}
                  />
                ))
              ) : (
                <div className="col-span-full text-center">
                  <img
                    src={notest} // Update with your image path
                    alt="No Tests Found"
                    className="mx-auto w-100 h-80" // Adjust width and height as needed
                  />
                  <p className="text-gray-500 text-xl font-semibold">No tests found for the selected filter.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6">
              <Pagination
                count={Math.ceil(filteredTests.length / getItemsPerPage())}
                page={page}
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
          </>
        )}
      </div>

      {/* Modal for Create Test */}
      <Dialog
        open={isModalOpen}
        onClose={handleModalClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px', // Smooth curved corners for the modal
            padding: '16px',
            backgroundColor: isDarkMode ? 'gray-800' : 'white',
            color: isDarkMode ? 'white' : 'black',
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" align="center" fontWeight="bold">
            Select Test Type
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleModalClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '250px', // Increased height for better spacing
                  border: '1px solid #E0E0E0',
                  borderRadius: '24px', // Smooth curved corners for boxes
                  cursor: 'pointer',
                  transition: 'transform 0.3s, box-shadow 0.3s', // Smooth hover animations
                  '&:hover': {
                    backgroundColor: '#f9faff',
                    transform: 'scale(1.05)', // Slight zoom effect
                    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)', // Add shadow on hover
                  },
                  backgroundColor: isDarkMode ? 'gray-800' : 'white',
                  color: isDarkMode ? 'white' : 'black',
                }}
                onClick={() => {
                  navigate('/mcq/details');
                  handleModalClose();
                }}
              >
                <img src={mcq} alt="Skill Assessment" style={{ maxWidth: '80px', margin: '0 auto' }} />
                <Typography variant="h6" mt={3}>
                  Skill Assessment
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Evaluations to test knowledge and skills across different topics
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '250px', // Increased height for better spacing
                  border: '1px solid #E0E0E0',
                  borderRadius: '24px', // Smooth curved corners for boxes
                  cursor: 'pointer',
                  transition: 'transform 0.3s, box-shadow 0.3s', // Smooth hover animations
                  '&:hover': {
                    backgroundColor: '#f9faff',
                    transform: 'scale(1.05)', // Slight zoom effect
                    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)', // Add shadow on hover
                  },
                  backgroundColor: isDarkMode ? 'gray-800' : 'white',
                  color: isDarkMode ? 'white' : 'black',
                }}
                onClick={() => {
                  navigate('/coding/details');
                  handleModalClose();
                }}
              >
                <img src={code} alt="Code Contest" style={{ maxWidth: '80px', margin: '0 auto' }} />
                <Typography variant="h6" mt={3}>
                  Code Contest
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Challenges to assess programming and problem-solving skills
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mt: 3 }}>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ textAlign: 'center', width: '100%', marginBottom: '16px' }}
          >
            You can select a test type to proceed or close the dialog.
          </Typography>
        </DialogActions>
      </Dialog>

      {/* Toggle Button */}
      {showToggle && (
        <button
          className="fixed bottom-4 right-4 bg-[#000a7500] text-transparent p-2 rounded-full"
          onClick={toggleDarkMode}
        >
          Toggle
        </button>
      )}
    </div>
  );
};

export default Dashboard;
