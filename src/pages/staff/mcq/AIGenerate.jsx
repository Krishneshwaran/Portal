import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AIGenerate = () => {
  const [formData, setFormData] = useState({
    topic: "",
    subtopic: "",
    level: [], // Array of objects with value and percentage
    question_type: "Multiple Choice",
    num_questions: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "level") {
      // Handle multiple level selections
      setFormData((prevData) => {
        let newLevels = [...prevData.level];
        if (checked) {
          // Add the level with an initial percentage of 0
          newLevels.push({ value: value, percentage: "" });  // Initial percentage
        } else {
          // Remove the level
          newLevels = newLevels.filter((level) => level.value !== value);
        }
        return { ...prevData, level: newLevels };
      });
    } else if (name === "num_questions") {
      // Update number of questions
      setFormData((prevData) => ({
        ...prevData,
        num_questions: value,
      }));
    }
    else {
      // Handle other input changes as before
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleLevelPercentageChange = (levelValue, percentage) => {
    // Function to update the percentage for a specific level
    setFormData((prevData) => {
      const updatedLevels = prevData.level.map((level) => {
        if (level.value === levelValue) {
          return { ...level, percentage: percentage };
        }
        return level;
      });
      return { ...prevData, level: updatedLevels };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        alert("Unauthorized access. Please log in again.");
        setLoading(false);
        return;
      }

      // Validation
      if (!formData.num_questions) {
        alert("Please enter the number of questions.");
        setLoading(false);
        return;
      }

      const numQuestions = parseInt(formData.num_questions, 10);
      if (isNaN(numQuestions) || numQuestions <= 0) {
        alert("Number of questions must be a positive number.");
        setLoading(false);
        return;
      }

      const totalPercentage = formData.level.reduce((sum, level) => {
        const percentage = parseFloat(level.percentage);
        return sum + (isNaN(percentage) ? 0 : percentage);  // Use 0 for NaN values
      }, 0);

      if (totalPercentage !== 100) {
        alert("Total percentage of Bloom's levels must be equal to 100.");
        setLoading(false);
        return;
      }

      // Prepare data for the backend
      const requestData = {
        topic: formData.topic,
        subtopic: formData.subtopic,
        num_questions: numQuestions,
        question_type: "Multiple Choice",
        level_distribution: formData.level.map((level) => ({
          level: level.value,
          count: Math.round((parseFloat(level.percentage) / 100) * numQuestions), // Calculate the questions per level
        })),
      };


      const response = await axios.post(
        `${API_BASE_URL}/api/mcq/api/generate-questions/`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccessMessage("Questions generated successfully! Redirecting...");
      setErrorMessage(null);

      const { questions } = response.data;
      navigate("/mcq/airesponse", { state: { questions } });
    } catch (error) {
      console.error("Error generating questions:", error);
      setErrorMessage("Failed to generate questions. Please try again later.");
      setSuccessMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const bloomLevels = [
    { value: "Remembering", label: "Remembering - L1" },
    { value: "Understanding", label: "Understanding - L2" },
    { value: "Applying", label: "Applying - L3" },
    { value: "Analyzing", label: "Analyzing - L4" },
    { value: "Evaluating", label: "Evaluating - L5" },
    { value: "Creating", label: "Creating - L6" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Question Generator AI</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic */}
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
              Topic
            </label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Subtopic */}
          <div>
            <label htmlFor="subtopic" className="block text-sm font-medium text-gray-700">
              Subtopic
            </label>
            <input
              type="text"
              id="subtopic"
              name="subtopic"
              value={formData.subtopic}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bloom's Taxonomy Levels
            </label>
            <div className="mt-2 space-y-2">
              {bloomLevels.map((level) => (
                <div key={level.value} className="w-[30vw] h-8 flex justify-between items-center">
                  <div className="flex"><input
                    type="checkbox"
                    id={`level-${level.value}`}
                    name="level"
                    value={level.value}
                    checked={formData.level.some((l) => l.value === level.value)}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                    <label
                      htmlFor={`level-${level.value}`}
                      className="ml-2 block text-sm text-gray-900"
                    >
                      {level.label}
                    </label></div>
                  {/* Percentage Input */}
                  {formData.level.some((l) => l.value === level.value) && (
                    <input
                      type="number"
                      placeholder="Percentage"
                      min="0"
                      max="100"
                      value={
                        formData.level.find((l) => l.value === level.value)
                          ?.percentage || ""
                      }
                      onChange={(e) =>
                        handleLevelPercentageChange(level.value, e.target.value)
                      }
                      className="ml-4 w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Question Type */}
          <div>
            <label htmlFor="question_type" className="block text-sm font-medium text-gray-700">
              Type of Questions
            </label>
            <select
              id="question_type"
              name="question_type"
              value={formData.question_type}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              disabled // Disable the dropdown to enforce "Multiple Choice" as the only option
            >
              <option value="Multiple Choice">Multiple Choice</option>
            </select>
          </div>

          {/* Number of Questions */}
          <div>
            <label htmlFor="num_questions" className="block text-sm font-medium text-gray-700">
              Number of Questions
            </label>
            <input
              type="number"
              id="num_questions"
              name="num_questions"
              value={formData.num_questions}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
            disabled={loading} // Disable button while loading
          >
            {loading ? "Generating..." : "Generate Questions"}
          </button>
        </form>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center mt-4">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Success/Error Messages */}
        {errorMessage && <p className="mt-4 text-red-600">{errorMessage}</p>}
        {successMessage && <p className="mt-4 text-green-600">{successMessage}</p>}
      </div>
    </div>
  );
};

export default AIGenerate;