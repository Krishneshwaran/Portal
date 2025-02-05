import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search as SearchIcon } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const McqLibrary = ({ onClose, onQuestionsSelected }) => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('contestToken');
        if (!token) {
          toast.error('Unauthorized access. Please log in again.');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/fetch-all-questions/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sanitizedQuestions = response.data.questions.map(question => ({
          ...question,
          tags: Array.isArray(question.tags) ? question.tags : []
        }));

        setQuestions(sanitizedQuestions);
        setFilteredQuestions(sanitizedQuestions);
        setError(null);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to fetch questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    if (filter) {
      setFilteredQuestions(
        questions.filter((q) =>
          q.question.toLowerCase().includes(filter.toLowerCase()) ||
          q.options.some(option => option.toLowerCase().includes(filter.toLowerCase()))
        )
      );
    } else {
      setFilteredQuestions(questions);
    }
  }, [filter, questions]);

  const toggleQuestionSelection = (index) => {
    setSelectedQuestions((prevSelected) =>
      prevSelected.includes(index)
        ? prevSelected.filter((id) => id !== index)
        : [...prevSelected, index]
    );
  };

  const handleSubmit = async () => {
    const selected = selectedQuestions.map((index) => questions[index]);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Question Library</h1>
          <p className="text-slate-600">Select and preview questions from your collection</p>
        </div>
        {loading && <p>Loading questions...</p>}
        {error && <p className="text-red-600">{error}</p>}
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-4">
            <div className="sticky top-4 bg-white p-4 shadow rounded-lg">
              <div className="flex items-center">
                <SearchIcon className="mr-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="flex-grow px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
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
          </div>
          <div className="col-span-1">
            <div className="bg-white shadow p-4 rounded-lg">
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">
                  {selectedQuestions.length} questions selected
                </span>
                <button
                  onClick={onClose}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Back
                </button>
              </div>
              <h2 className="text-lg font-bold mb-4">Selected Questions</h2>
              {selectedQuestions.length === 0 ? (
                <p className="text-slate-500">No questions selected</p>
              ) : (
                <ul>
                  {selectedQuestions.map((index) => {
                    const question = questions[index];
                    return (
                      <li key={index} className="border-b py-2 flex justify-between items-center">
                        {question?.question}
                        <button
                          onClick={() => {
                            setSelectedQuestions((prevSelected) =>
                              prevSelected.filter((id) => id !== index)
                            );
                          }}
                          className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <button
                onClick={handleSubmit}
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg"
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

export default McqLibrary;
