import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SelectTestQuestion = ({ onClose, onQuestionsSelected }) => {
  const [tests, setTests] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [filter, setFilter] = useState('');
  const [filters, setFilters] = useState({ level: [], tags: [] });
  const [availableTags, setAvailableTags] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('contestToken');
        if (!token) {
          toast.error('Unauthorized access. Please log in again.');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/fetch-all-tests/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Ensure tags are always arrays
        const sanitizedTests = response.data.tests.map(test => ({
          ...test,
          questions: test.questions.map(question => ({
            ...question,
            tags: Array.isArray(question.tags) ? question.tags : []
          }))
        }));

        setTests(sanitizedTests);
        setFilteredQuestions([]); // Initially set to an empty array
        setError(null);

        // Extract available tags
        const tagsSet = new Set();
        sanitizedTests.forEach(test => {
          test.questions.forEach(question => {
            question.tags.forEach(tag => tagsSet.add(tag));
          });
        });
        setAvailableTags(Array.from(tagsSet));
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to fetch questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Filter and sort questions based on search input, selected tag, and selected difficulty
  useEffect(() => {
    if (selectedTest) {
      let filtered = selectedTest.questions;

      if (filter) {
        filtered = filtered.filter((q) =>
          q.question.toLowerCase().includes(filter.toLowerCase())
        );
      }

      if (filters.tags.length > 0) {
        filtered = filtered.filter((q) =>
          filters.tags.some(tag => q.tags.includes(tag))
        );
      }

      if (filters.level.length > 0) {
        filtered = filtered.filter((q) =>
          filters.level.some(diff => diff.toLowerCase() === q.level.toLowerCase())
        );
      }

      setFilteredQuestions(filtered);
    }
  }, [filter, filters, selectedTest]);

  // Toggle question selection
  const toggleQuestionSelection = (index) => {
    setSelectedQuestions((prevSelected) =>
      prevSelected.includes(index)
        ? prevSelected.filter((id) => id !== index)
        : [...prevSelected, index]
    );
  };

  // Toggle select all/deselect all questions
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map((_, index) => index));
    }
    setSelectAll(!selectAll);
  };

  // Handle filter toggle
  const toggleFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ level: [], tags: [] });
    setFilter('');
  };

  // Submit Selected Questions
  const handleSubmit = async () => {
    const selected = selectedQuestions.map((index) => filteredQuestions[index]);
    onQuestionsSelected(selected);
    onClose();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Question Library</h1>
          <p className="text-slate-600">Select and preview questions from your collection</p>
        </div>

        {loading && <p>Loading questions...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid grid-cols-12 gap-8">
          {/* Left Panel for Test Names */}
          <div className="col-span-2 space-y-4">
            {tests.map((test, testIndex) => (
              <div
                key={test.test_id}
                className={`bg-white p-4 shadow rounded-lg cursor-pointer ${
                  selectedTest?.test_id === test.test_id ? 'bg-blue-100 border-blue-500' : ''
                }`}
                onClick={() => setSelectedTest(test)}
              >
                <h2 className="text-lg font-bold">{test.test_name}</h2>
              </div>
            ))}
          </div>

          {/* Middle Panel for Questions List */}
          <div className="col-span-7 space-y-4">
            {selectedTest ? (
              <>
                {/* Search Bar and Select/Deselect Button */}
                <div className="sticky top-4 bg-white p-4 shadow rounded-lg flex items-center justify-between">
                  <button
                    onClick={toggleSelectAll}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                  >
                    {selectAll ? 'Deselect All' : 'Select All'}
                  </button>
                  <div className="flex items-center flex-grow ml-4">
                    <Search className="mr-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="flex-grow px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Questions List */}
                {filteredQuestions.map((question, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer ${
                      selectedQuestions.includes(index) ? 'bg-blue-100 border-blue-500' : ''
                    }`}
                    onClick={() => toggleQuestionSelection(index)}
                  >
                    <h3 className="font-medium">{question.question}</h3>
                    <p>
                      <strong>Level:</strong> {question.level} | <strong>Tags:</strong>{' '}
                      {Array.isArray(question.tags) ? question.tags.join(', ') : 'No tags'}
                    </p>
                  </div>
                ))}
              </>
            ) : (
              <div className="bg-white p-4 shadow rounded-lg">
                <p className="text-slate-600">Please select a test to view questions.</p>
              </div>
            )}
          </div>

          {/* Right Panel for Selected Questions */}
          <div className="col-span-3">
            <div className="bg-white shadow p-4 rounded-lg">
              <h2 className="text-lg font-bold mb-4">Selected Questions</h2>
              {selectedQuestions.length === 0 ? (
                <p className="text-slate-500">No questions selected</p>
              ) : (
                <ul>
                  {selectedQuestions.map((index) => {
                    const question = filteredQuestions[index];
                    return (
                      <li key={index} className="border-b py-2">
                        {question?.question}
                      </li>
                    );
                  })}
                </ul>
              )}
              <button
                onClick={handleSubmit}
                className="mt-4 w-full bg-black text-white py-2 px-4 rounded-lg"
              >
                Save Selected Questions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectTestQuestion;
