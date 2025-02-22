import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import axios from 'axios';
import TestQuestionDetails from './TestQuestionDetails';
import Pagination from '@mui/material/Pagination';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FiltersSidebar from './TestFiltersSidebar';
import Header from './TestHeader';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const McqTestQuestionList = ({
  testId,
  setSelectedQuestion,
  currentPage,
  setCurrentPage,
  isEditMode,
  deleteSelectedQuestions,
  view,
  setView,
  selectedQuestion,
  handleManualAdd,
  handleBulkUpload,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [filters, setFilters] = useState({ level: [], tags: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSingleQuestionModalOpen, setIsSingleQuestionModalOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [duplicateQuestions, setDuplicateQuestions] = useState([]);

  const fetchQuestions = useCallback(async () => {
    try {
      console.log("Fetching questions for test ID:", testId);
      if (!testId) {
        console.error("Test ID is undefined");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/fetch_questions_for_test/?test_id=${testId}`);
      console.log("API Response:", response.data);

      if (response.data.error) {
        setError(response.data.error);
        setQuestions([]);
        toast.error("Error fetching questions.");
      } else {
        let fetchedQuestions = response.data.questions;

        // Extract unique tags from questions
        const tagsSet = new Set();
        fetchedQuestions.forEach(question => {
          question.tags.forEach(tag => tagsSet.add(tag));
        });
        setAvailableTags(Array.from(tagsSet));

        // Remove duplicate questions
        const questionMap = new Map();
        const uniqueQuestions = [];
        const duplicates = [];
        fetchedQuestions.forEach(question => {
          if (questionMap.has(question.question)) {
            duplicates.push(question);
          } else {
            questionMap.set(question.question, true);
            uniqueQuestions.push(question);
          }
        });

        setQuestions(uniqueQuestions);
        setDuplicateQuestions(duplicates);

        // Automatically delete duplicate questions
        if (duplicates.length > 0) {
          const duplicateIds = duplicates.map(question => question.question_id);
          await Promise.all(duplicateIds.map(id => axios.delete(`${API_BASE_URL}/api/delete-question-from-test/${testId}/${id}/`)));
          toast.success("Duplicate questions deleted successfully!");
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Failed to fetch questions. Please try again.");
      setLoading(false);
      toast.error("Failed to fetch questions. Please try again.");
    }
  }, [testId]);

  useEffect(() => {
    fetchQuestions();
  }, [testId, fetchQuestions]);

  useEffect(() => {
    filterQuestions();
  }, [questions, filters, searchQuery]);

  const onDeleteQuestion = async (question_id) => {
    if (!testId) {
      console.error("Test ID is undefined");
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/delete-question-from-test/${testId}/${question_id}/`);
      if (response.status === 200) {
        setQuestions(questions.filter(question => question.question_id !== question_id));
        toast.success("Question deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete the question. Please try again.");
    } finally {
      setDeleting(false);
      setShowConfirmModal(false);
    }
  };

  const handleDeleteClick = (question_id) => {
    setQuestionToDelete(question_id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (questionToDelete) {
      onDeleteQuestion(questionToDelete);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setQuestionToDelete(null);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const toggleFilter = (filterType, value) => {
    setFilters(prevFilters => {
      let newFilters = { ...prevFilters };
      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
      } else {
        newFilters[filterType] = [...newFilters[filterType], value];
      }
      return newFilters;
    });
    // Prevent page change when toggling filters
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ level: [], tags: [] });
    setCurrentPage(1); // Reset to the first page when clearing filters
  };

  const filterQuestions = () => {
    let filteredQuestions = questions;

    // Apply level filters
    if (filters.level.length > 0) {
      filteredQuestions = filteredQuestions.filter(question =>
        filters.level.includes(question.level)
      );
    }

    // Apply tag filters
    if (filters.tags.length > 0) {
      filteredQuestions = filteredQuestions.filter(question =>
        filters.tags.some(tag => question.tags.includes(tag))
      );
    }

    // Apply search query filter
    if (searchQuery) {
      filteredQuestions = filteredQuestions.filter(question =>
        question.question.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setCurrentQuestions(filteredQuestions);
  };

  const getItemsPerPage = () => 10;

  const indexOfLastQuestion = currentPage * getItemsPerPage();
  const indexOfFirstQuestion = indexOfLastQuestion - getItemsPerPage();
  const currentQuestionsSlice = currentQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_7fr] gap-4">
      <FiltersSidebar
        filters={filters}
        toggleFilter={toggleFilter}
        clearFilters={clearFilters}
        availableTags={availableTags}
      />
      <div className="bg-white px-8 py-4 pt-1 rounded-lg relative">
        <div className="flex flex-col">
          <Header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setIsModalOpen={setIsModalOpen}
            setIsSingleQuestionModalOpen={setIsSingleQuestionModalOpen}
            totalQuestions={currentQuestions.length} // Pass the length of currentQuestions
            handleManualAdd={handleManualAdd}  // Pass function
            handleBulkUpload={handleBulkUpload} // Pass function
          />
          <div className="space-y-2 flex-grow">
            <ToastContainer />
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
                <strong className="font-medium">Error: </strong>
                <span>{error}</span>
              </div>
            ) : currentQuestions.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                <strong className="font-medium">No Results: </strong>
                <span>No questions found.</span>
              </div>
            ) : (
              <>
                {currentQuestionsSlice.map((question, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-400 hover:shadow-md hover:scale-y-102 transition-all cursor-pointer p-4"
                    onClick={() => {
                      setSelectedQuestion(question);
                      // setView('details');
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#ffcc00] text-[#111933] rounded-full font-semibold text-sm">
                        {indexOfFirstQuestion + index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-base text-[#111933]">{question.question}</p>
                          <div className='flex space-x-3 items-center'>
                            <p className='text-sm text-[#111933] font-semibold'> Ans: <span className='font-normal'> {question.correctAnswer} </span> </p>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(question.question_id); }}>
                              <Trash2 className="w-5 h-5 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {currentQuestions.length > 0 && (
                  <div className="flex justify-center">
                    <Pagination
                      count={Math.ceil(currentQuestions.length / getItemsPerPage())}
                      page={currentPage}
                      onChange={handlePageChange}
                      sx={{
                        '& .MuiPaginationItem-root': {
                          color: '#111933',
                        },
                        '& .MuiPaginationItem-root.Mui-selected': {
                          backgroundColor: '#FDC500',
                          color: '#fff',
                        },
                        '& .MuiPaginationItem-root:hover': {
                          backgroundColor: 'rgba(0, 9, 117, 0.1)',
                        },
                      }}
                    />
                  </div>
                )}
              </>
            )}
            {deleting && (
              <div className="flex justify-center items-center mt-4">
                <Loader2 className="animate-spin" size={24} />
              </div>
            )}
            {deleteError && (
              <div className="text-red-500 text-center mt-4">
                {deleteError}
              </div>
            )}
            {view === 'details' && selectedQuestion && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="z-[1000] bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                  <TestQuestionDetails
                    selectedQuestion={selectedQuestion}
                    setSelectedQuestion={setSelectedQuestion}
                    setView={setView}
                  />
                </div>
              </div>
            )}
            {showConfirmModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 10000 }}>
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                  <p className="text-lg font-medium text-gray-900">Are you sure you want to delete this question?</p>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleCancelDelete}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default McqTestQuestionList;
