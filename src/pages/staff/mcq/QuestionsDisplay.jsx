import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const QuestionsDisplay = () => {
  const { state } = useLocation();
  const { questions } = state || {};
  const navigate = useNavigate();

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [editedQuestions, setEditedQuestions] = useState(questions || []);
  const [isEditing, setIsEditing] = useState(null);
  const [levelReport, setLevelReport] = useState({}); // New state for the report
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    // Calculate the level report whenever the questions change
    if (editedQuestions && editedQuestions.length > 0) {
      calculateLevelReport();
    }
  }, [editedQuestions]);

  const calculateLevelReport = () => {
    const totalQuestions = editedQuestions.length;
    const levelCounts = {};

    editedQuestions.forEach(question => {
      const level = question.level;
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });

    const report = {};
    for (const level in levelCounts) {
      const count = levelCounts[level];
      report[level] = ((count / totalQuestions) * 100).toFixed(2); // Percentage
    }

    setLevelReport(report);
  };

  const handleSelectQuestion = (index) => {
    setSelectedQuestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === editedQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(editedQuestions.map((_, index) => index));
    }
  };

  const handleEditQuestion = (index, field, value) => {
    const updatedQuestions = editedQuestions.map((question, i) =>
      i === index ? { ...question, [field]: value } : question
    );
    setEditedQuestions(updatedQuestions);
  };

  const handleSaveQuestions = async () => {
    try {
      const token = localStorage.getItem("contestToken");
      const selected = selectedQuestions.map((index) => editedQuestions[index]);

      await axios.post(`${API_BASE_URL}/api/mcq/save-questions/`, {
        questions: selected,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert("Questions saved successfully!");
      navigate('/mcq/QuestionsDashboard');
    } catch (error) {
      console.error("Error saving questions:", error);
      alert("Failed to save questions.");
    }
  };

  if (!questions || questions.length === 0) {
    return <p>No questions to display.</p>;
  }

  return (
    <div className="min-h-[90%] bg-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white mt-3 pb-5 shadow-lg rounded-3xl p-8 w-[90%] max-w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Generated Questions</h1>

        <div className="space-y-6 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#111933]">Generated Questions Preview</h2>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              {selectedQuestions.length === editedQuestions.length
                ? "Deselect All"
                : "Select All"}
            </button>
            <span className="text-sm text-gray-600">
              {selectedQuestions.length} of {editedQuestions.length} questions selected
            </span>
          </div>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 w-full">
            {editedQuestions.map((question, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg transition-colors ${
                  selectedQuestions.includes(index)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(index)}
                    onChange={() => handleSelectQuestion(index)}
                    className="mt-1.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-3">
                      Q{index + 1}. {question.question}
                    </p>
                    <div className="pl-4 space-y-2">
                      {question.options.map((option, optIndex) => (
                        <p
                          key={optIndex}
                          className={`${
                            option === question.correctAnswer
                              ? "text-green-600 font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              onClick={() => navigate('/mcq/QuestionsDashboard')}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveQuestions}
              disabled={selectedQuestions.length === 0}
              className="px-4 py-2 bg-[#111933] text-white rounded-md hover:bg-[#2a3958] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Save Selected Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionsDisplay;
