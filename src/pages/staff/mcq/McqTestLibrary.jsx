import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faArrowLeft, faPlus, faFilter, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FaArrowRightLong } from "react-icons/fa6";
import Modal from 'react-modal';
import AddTest from '../../../components/McqLibrary/AddTest';
import McqTestQuestionList from '../../../components/McqLibrary/McqTestQuestionList';
import QuestionDetails from '../../../components/McqLibrary/QuestionDetails';
import testicon from "../../../assets/TestLibrary.svg";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from '@mui/material/Pagination';
import FiltersSidebar from '../../../components/McqLibrary/FiltersSidebar'; // Import the FiltersSidebar component

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

Modal.setAppElement('#root');

const Mcqtest = () => {
  const [allTests, setAllTests] = useState([]);
  const [testName, setTestName] = useState("");
  const [testLevel, setTestLevel] = useState("");
  const [testTags, setTestTags] = useState([]);
  const [testTagsInput, setTestTagsInput] = useState("");
  const [questions, setQuestions] = useState([{ question: "", options: ["", "", "", ""], answer: "", level: "", tags: [] }]);
  const [editingTestId, setEditingTestId] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState([]);
  const [filterCategory, setFilterCategory] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]); // Define levels state
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const location = useLocation();

  const fetchAllTests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/fetch-all-tests/`);
      setAllTests(response.data.tests);

      // Extract unique categories and levels
      const uniqueCategories = [...new Set(response.data.tests.map(test => test.category))];
      const uniqueLevels = [...new Set(response.data.tests.map(test => test.level))];
      setCategories(uniqueCategories);
      setLevels(uniqueLevels); // Set levels state
    } catch (error) {
      console.error("Error fetching tests:", error);
      toast.error("Error fetching tests.");
    }
  };

  useEffect(() => {
    fetchAllTests();
    if (location.state && location.state.isEditMode) {
      handleEdit(location.state.test);
    }
  }, [location.state]);

  const updateTest = async (testId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/update-test/${testId}/`, {
        test_name: testName,
        level: testLevel,
        tags: testTags,
        questions: questions.map(q => ({
          question_id: q.question_id || uuidv4(),
          question: q.question,
          options: q.options,
          answer: q.answer,
          level: q.level,
          tags: q.tags
        }))
      });
      toast.success(response.data.message);
      fetchAllTests();
      clearForm();
      setEditingTestId(null);
      setSelectedTest(null);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating test:", error);
      toast.error("Error updating test.");
    }
  };

  const deleteSelectedQuestions = async () => {
    try {
      const updatedQuestions = questions.filter(q => !selectedQuestions.includes(q.question_id));
      setQuestions(updatedQuestions);
      setSelectedQuestions([]);
      toast.success("Selected questions deleted successfully.");
    } catch (error) {
      console.error("Error deleting selected questions:", error);
      toast.error("Error deleting selected questions.");
    }
  };

  const clearForm = () => {
    setTestName("");
    setTestLevel("");
    setTestTags([]);
    setTestTagsInput("");
    setQuestions([{ question: "", options: ["", "", "", ""], answer: "", level: "", tags: [] }]);
  };

  const handleEdit = (test) => {
    setTestName(test.test_name);
    setTestLevel(test.level);
    setTestTags(test.tags);
    setQuestions(test.questions.map(q => ({
      ...q,
      tags: q.tags || []
    })));
    setEditingTestId(test.test_id);
    setSelectedTest(test);
    setIsEditMode(true);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], answer: "", level: "", tags: [] }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === "tags") {
      newQuestions[index][field] = value;
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleUpdate = async (questionId) => {
    setIsLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/update-question/${questionId}/`, selectedQuestion);
      toast.success(response.data.message);
      fetchAllTests();
      setSelectedQuestion(null);
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Error updating question.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionSelect = (questionId) => {
    setSelectedQuestions(prevSelected =>
      prevSelected.includes(questionId)
        ? prevSelected.filter(id => id !== questionId)
        : [...prevSelected, questionId]
    );
  };

  const handleTestLevelChange = (e) => {
    setTestLevel(e.target.value);
  };

  const handleTestTagsChange = (e) => {
    setTestTagsInput(e.target.value);
    if (e.target.value.endsWith(',')) {
      const newTag = e.target.value.slice(0, -1).trim();
      if (newTag && !testTags.includes(newTag)) {
        setTestTags([...testTags, newTag]);
      }
      setTestTagsInput('');
    }
  };

  const handleTestTagsKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = testTagsInput.trim();
      if (newTag && !testTags.includes(newTag)) {
        setTestTags([...testTags, newTag]);
      }
      setTestTagsInput('');
    }
  };

  const removeTestTag = (tagIndex) => {
    const newTags = testTags.filter((_, i) => i !== tagIndex);
    setTestTags(newTags);
  };

  const handleCategorySelect = (category) => {
    setFilterCategory(prevCategories =>
      prevCategories.includes(category)
        ? prevCategories.filter(cat => cat !== category)
        : [...prevCategories, category]
    );
  };

  const handleLevelSelect = (level) => {
    setFilterLevel(prevLevels =>
      prevLevels.includes(level)
        ? prevLevels.filter(lvl => lvl !== level)
        : [...prevLevels, level]
    );
  };

  const openModal = (test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTest(null);
  };

  const openQuestionModal = (question) => {
    setSelectedQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const closeQuestionModal = () => {
    setIsQuestionModalOpen(false);
    setSelectedQuestion(null);
  };

  const handleTestClick = (test) => {
    navigate('/mcq/TestLibrary/Questionlist', { state: { test } });
  };

  const deleteTest = async (testId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/delete-test/${testId}/`);
      toast.success("Test deleted successfully!");
      fetchAllTests();
      setSelectedTest(null);
    } catch (error) {
      console.error("Error deleting test:", error);
      toast.error("Error deleting test.");
    }
  };

  const handleDeleteClick = (test_id) => {
    setTestToDelete(test_id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (testToDelete) {
      deleteTest(testToDelete);
      setShowConfirmModal(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setTestToDelete(null);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getItemsPerPage = () => itemsPerPage;

  const filteredTests = allTests.filter(test =>
    test.test_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (filterLevel.length ? filterLevel.includes(test.level) : true) &&
    (filterCategory.length ? filterCategory.includes(test.category) : true)
  );

  const paginatedTests = filteredTests.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'easy':
        return '#388E3C';
      case 'medium':
        return '#FBC02D';
      case 'hard':
        return '#D32F2F';
      default:
        return '#111933';
    }
  };

  const toCamelCase = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-[#f4f6ff] py-10 px-20 flex flex-col">
      <ToastContainer />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mt-4 mb-6">
          <h2 className="text-2xl font-bold text-primary">Test Library</h2>
          <p className="my-4 text-[#111933">Embark on a journey to sharpen your analytical thinking and problem-solving skills with our "Logical Reasoning Fundamentals & Best Practices" course. Embark on a journey to sharpen your analytical thinking and problem.</p>
        </div>
        <div className="flex items-stretch">
          <FiltersSidebar
            filters={{ level: filterLevel, tags: filterCategory }}
            toggleFilter={(filterType, filterValue) => {
              if (filterType === 'level') {
                handleLevelSelect(filterValue);
              } else if (filterType === 'tags') {
                handleCategorySelect(filterValue);
              }
            }}
            clearFilters={() => {
              setFilterLevel([]);
              setFilterCategory([]);
            }}
            availableTags={categories}
          />
          <div className="flex-1 ml-6 border rounded-xl overflow-x-hidden flex flex-col">
            {isAddingTest ? (
              <AddTest fetchAllTests={fetchAllTests} setIsAddingTest={setIsAddingTest} />
            ) : (
              <div className="bg-white rounded-lg">
                <div className="pt-4 mx-5 flex justify-between items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="shadow border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-1"
                  />
                  <button
                    onClick={() => navigate("/library/mcq/test/addtest")}
                    className="bg-[#111933] text-white p-2 flex items-center border-2 border-[#111933] rounded-lg"
                  >
                    Create Library
                  </button>
                </div>

                <div className="bg-white rounded-xl p-5 flex-1 overflow-y-auto">
                  {paginatedTests.map((test, localIndex) => {
                    const globalIndex = (page - 1) * itemsPerPage + localIndex;
                    return (
                      <div
                        key={test.test_id}
                        className="w-full bg-white border border-gray-400 rounded-lg my-2 py-3 px-4 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-[#ffcc00] rounded flex items-center justify-center font-semibold text-sm">
                              {globalIndex + 1}
                            </div>
                            <h3 className="font-bold text-lg text-primary flex-grow">{test.test_name}</h3>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm ml-7">
                          <div className="flex justify-between w-3/5">
                            <div className="flex space-x-2 text-lg">
                              <p className="font-semibold">Level:</p>
                              <p className="text-[#111933]">{toCamelCase(test.level)}</p>
                            </div>
                            <div className="flex space-x-2 text-lg">
                              <p className="font-semibold">Category:</p>
                              <p className="text-[#111933]">{test.category}</p>
                            </div>
                            <div className="flex space-x-2 text-lg">
                              <p className="font-semibold">Blooms:</p>
                              <p className="text-[#111933]">{test.blooms || "L1 Remembering"}</p>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2 w-2/5">
                            <button
                              className="text-white px-2 py-1 rounded bg-[#111933] border-2 border-[#111933] hover:scale-y-102"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(test.test_id);
                              }}
                            >
                              Delete
                            </button>
                            <button
                              className="text-primary px-2 py-1 rounded bg-white border border-[#111933] hover:scale-y-102 flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTestClick(test);
                              }}
                            >
                              View Test <FaArrowRightLong className="ml-2" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-center mt-4">
              <Pagination
                count={Math.ceil(filteredTests.length / getItemsPerPage())}
                page={page}
                onChange={handlePageChange}
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "#111933",
                  },
                  "& .MuiPaginationItem-root.Mui-selected": {
                    backgroundColor: "#111933",
                    color: "#fff",
                  },
                  "& .MuiPaginationItem-root:hover": {
                    backgroundColor: "#111933",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedTest && (
        <div className="w-full p-4 bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-primary">{selectedTest.test_name}</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => handleEdit(selectedTest)}
                className="bg-[#111933] text-white px-2 py-1 rounded-full flex items-center"
              >
                <FontAwesomeIcon icon={isEditMode ? faArrowLeft : faEdit} />
              </button>
              <button
                onClick={() => deleteTest(selectedTest.test_id)}
                className="bg-[#111933] text-white p-2 rounded-full flex items-center"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
          {isEditMode ? (
            <div>
              <div className="mb-4">
                <label className="block text-primary text-sm font-bold mb-2">Test Name:</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-primary text-sm font-bold mb-2">Test Level:</label>
                <select
                  value={testLevel}
                  onChange={handleTestLevelChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Select Level</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-primary text-sm font-bold mb-2">Test Tags:</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {testTags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        onClick={() => removeTestTag(tagIndex)}
                        className="ml-2 text-blue-800 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={testTagsInput}
                  onChange={handleTestTagsChange}
                  onKeyPress={handleTestTagsKeyPress}
                  placeholder="Type and press Enter or comma to add tags"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <McqTestQuestionList
                testId={selectedTest.test_id}
                questions={selectedTest.questions || []}
                setSelectedQuestion={setSelectedQuestion}
                currentQuestions={selectedTest.questions || []}
                currentPage={1}
                totalPages={1}
                setCurrentPage={() => { }}
                setQuestions={setQuestions}
                isEditMode={isEditMode}
                deleteSelectedQuestions={deleteSelectedQuestions}
              />
              <button
                onClick={() => updateTest(selectedTest.test_id)}
                className="bg-[#111933] text-white p-2 rounded-full"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <McqTestQuestionList
              testId={selectedTest.test_id}
              questions={selectedTest.questions || []}
              setSelectedQuestion={openQuestionModal}
              currentQuestions={selectedTest.questions || []}
              currentPage={1}
              totalPages={1}
              setCurrentPage={() => { }}
              setQuestions={setQuestions}
              isEditMode={isEditMode}
              deleteSelectedQuestions={deleteSelectedQuestions}
            />
          )}
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Question List Modal"
        className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">{selectedTest?.test_name}</h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div>
          <McqTestQuestionList
            testId={selectedTest?.test_id}
            questions={selectedTest?.questions || []}
            setSelectedQuestion={openQuestionModal}
            currentQuestions={selectedTest?.questions || []}
            currentPage={1}
            totalPages={1}
            setCurrentPage={() => { }}
            setQuestions={setQuestions}
            isEditMode={isEditMode}
            deleteSelectedQuestions={deleteSelectedQuestions}
          />
        </div>
      </Modal>
      <Modal
        isOpen={isQuestionModalOpen}
        onRequestClose={closeQuestionModal}
        contentLabel="Question Details Modal"
        className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Question Details</h2>
          <button onClick={closeQuestionModal} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div>
          <QuestionDetails
            selectedQuestion={selectedQuestion}
            setSelectedQuestion={setSelectedQuestion}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleUpdate={handleUpdate}
            isLoading={isLoading}
            setShowConfirm={() => { }}
          />
        </div>
      </Modal>
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <p className="text-lg font-medium text-gray-900">Are you sure you want to delete this library?</p>
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
      <Modal
        isOpen={isFilterModalOpen}
        onRequestClose={() => setIsFilterModalOpen(false)}
        contentLabel="Filter Modal"
        className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000]"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Filter Tests</h2>
          <button onClick={() => setIsFilterModalOpen(false)} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div>
          <div className="mb-4">
            <label className="block text-primary text-sm font-bold mb-2">Level:</label>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <span
                  key={level}
                  className={`inline-flex items-center bg-gray-200 text-gray-800 px-3 py-1 rounded-full cursor-pointer ${filterLevel.includes(level) ? 'bg-primary text-[#111933]' : ''}`}
                  onClick={() => handleLevelSelect(level)}
                >
                  {toCamelCase(level)}
                  {filterLevel.includes(level) && <FontAwesomeIcon icon={faTimes} className="ml-2" />}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-primary text-sm font-bold mb-2">Category:</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className={`inline-flex items-center bg-gray-200 text-gray-800 px-3 py-1 rounded-full cursor-pointer ${filterCategory.includes(category) ? 'bg-primary text-[#111933]' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                  {filterCategory.includes(category) && <FontAwesomeIcon icon={faTimes} className="ml-2" />}
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="bg-[#111933] text-white p-2 rounded-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </Modal>
    </div>

  );
};

export default Mcqtest;
