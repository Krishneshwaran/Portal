import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FiltersSidebar from '../../../components/McqLibrary/FiltersSidebar';
import Header from '../../../components/McqLibrary/Header';
import QuestionsList from '../../../components/McqLibrary/QuestionsList';
import QuestionModal from '../../../components/McqLibrary/QuestionModal';
import ImportModal from '../../../components/McqLibrary/ImportModal';
import QuestionDetails from '../../../components/McqLibrary/QuestionDetails';
import ConfirmationModal from '../../../components/McqLibrary/ConfirmationModal';
import axios from 'axios';

const Mcq = () => {
  // Consolidated state management
  const [modalStates, setModalStates] = useState({
    isModalOpen: false,
    isSingleQuestionModalOpen: false,
    showConfirm: false,
    isEditing: false
  });

  const [questionData, setQuestionData] = useState({
    questions: [],
    selectedQuestion: null,
    singleQuestionData: {
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      answer: "",
      level: "easy",
      tags: ""
    }
  });

  const [uiState, setUiState] = useState({
    loading: true,
    isLoading: false,
    error: null,
    uploadStatus: "",
    currentPage: 1,
    searchQuery: "",
    filters: { level: [], tags: [], section: [] },
    availableTags: [],
    availableSections: []
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  const navigate = useNavigate();
  const questionsPerPage = 10;

  // Unified modal state handlers
  const toggleModal = (modalType, value) => {
    setModalStates(prev => ({ ...prev, [modalType]: value }));
  };

  // API Handlers
  const handleApiRequest = async (url, method, body = null) => {
    try {
      const options = {
        method,
        headers: method === 'POST' || method === 'PUT'
          ? { 'Content-Type': 'application/json' }
          : {},
        body: body ? JSON.stringify(body) : null
      };

      const response = await fetch(`${API_BASE_URL}${url}`, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${method.toLowerCase()} data`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${method}):`, error);
      throw error;
    }
  };

  const fetchQuestions = useCallback(async () => {
    try {
      setUiState(prev => ({ ...prev, loading: true }));
      const data = await handleApiRequest('/api/fetch-all-questions/', 'GET');
      let fetchedQuestions = data.questions;

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

      setQuestionData(prev => ({ ...prev, questions: uniqueQuestions }));

      // Automatically delete duplicate questions
      if (duplicates.length > 0) {
        const duplicateIds = duplicates.map(question => question.question_id);
        await Promise.all(duplicateIds.map(id => axios.delete(`${API_BASE_URL}/api/delete_question/${id}/`)));
        toast.success("Duplicate questions deleted successfully!");
      }

      setUiState(prev => ({ ...prev, error: null }));
    } catch (err) {
      setUiState(prev => ({
        ...prev,
        error: 'Failed to load questions. Please try again later.'
      }));
    } finally {
      setUiState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const handleDelete = async (question_id) => {
    try {
      await handleApiRequest(`/api/delete_question/${question_id}/`, 'DELETE');
      toast.success('Question deleted successfully');
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const handleUpdate = async (question_id) => {
    try {
      setUiState(prev => ({ ...prev, isLoading: true }));

      await handleApiRequest(
        `/api/update_question/${question_id}/`,
        'PUT',
        {
          question: questionData.selectedQuestion.question,
          options: questionData.selectedQuestion.options,
          correctAnswer: questionData.selectedQuestion.correctAnswer,
          level: questionData.selectedQuestion.level,
          tags: questionData.selectedQuestion.tags,
        }
      );

      toggleModal('isEditing', false);
      toast.success('Question Updated Successfully!');

      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Failed to update question');
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleSingleQuestionSubmit = async (e) => {
    e.preventDefault();
    const { question, option1, option2, option3, option4, answer, level } = questionData.singleQuestionData;

    if (!question || !option1 || !option2 || !answer || !level) {
      setUiState(prev => ({
        ...prev,
        uploadStatus: "Error: Please fill in all required fields"
      }));
      return;
    }

    const options = [option1, option2, option3, option4];
    if (!options.includes(answer)) {
      setUiState(prev => ({
        ...prev,
        uploadStatus: "Error: Answer must be one of the options"
      }));
      return;
    }

    try {
      await handleApiRequest(
        '/api/upload-single-question/',
        'POST',
        questionData.singleQuestionData
      );

      toast.success('Question uploaded successfully!');
      setQuestionData(prev => ({
        ...prev,
        singleQuestionData: {
          question: "", option1: "", option2: "", option3: "", option4: "",
          answer: "", level: "easy", tags: ""
        }
      }));

      fetchQuestions();
      setTimeout(() => toggleModal('isSingleQuestionModalOpen', false), 1500);
    } catch (err) {
      setUiState(prev => ({
        ...prev,
        uploadStatus: "Error: Unable to upload question."
      }));
    }
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setUiState(prev => ({ ...prev, uploadStatus: "Error: Only CSV files are allowed." }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUiState(prev => ({ ...prev, uploadStatus: "Error: File size exceeds 5MB." }));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/mcq-bulk-upload/`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchQuestions();
        setTimeout(() => toggleModal('isModalOpen', false), 1500);
      } else {
        setUiState(prev => ({
          ...prev,
          uploadStatus: "Error: " + (data.error || "Unknown error.")
        }));
      }
    } catch (err) {
      setUiState(prev => ({
        ...prev,
        uploadStatus: "Error: Unable to upload file."
      }));
    }
  };

  // Filter handling
  const getFilteredQuestions = () => {
    return questionData.questions.filter(question => {
      const matchesSearch = question.question.toLowerCase().includes(uiState.searchQuery.toLowerCase()) ||
        question.options.some(option => option.toLowerCase().includes(uiState.searchQuery.toLowerCase()));

      const matchesLevel = uiState.filters.level.length === 0 ||
        uiState.filters.level.includes(question.level);

      const questionTags = typeof question.tags === 'string'
        ? question.tags.split(',').map(tag => tag.trim())
        : question.tags || [];
      const matchesTags = uiState.filters.tags.length === 0 ||
        uiState.filters.tags.some(tag => questionTags.includes(tag));

      const matchesSection = uiState.filters.section.length === 0 ||
        uiState.filters.section.includes(question.section);

      return matchesSearch && matchesLevel && matchesTags && matchesSection;
    });
  };

  // Effects
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    const tags = new Set();
    const sections = new Set();

    questionData.questions.forEach(question => {
      if (question.tags) {
        const questionTags = typeof question.tags === 'string'
          ? question.tags.split(',').map(tag => tag.trim())
          : question.tags;
        questionTags.forEach(tag => tags.add(tag));
      }
      if (question.section) {
        sections.add(question.section);
      }
    });

    setUiState(prev => ({
      ...prev,
      availableTags: Array.from(tags),
      availableSections: Array.from(sections)
    }));
  }, [questionData.questions]);

  // Pagination calculations
  const filteredQuestions = getFilteredQuestions();
  const indexOfLastQuestion = uiState.currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  return (
    <div className="min-h-screen bg-[#ecf2fe]">
      
      <ToastContainer />
      <div className="max-w-full mx-auto px-24 py-12">
        <div className="bg-white p-14 main-container">
          <h3 className="font-semibold text-2xl mb-1.5 text-[#111933]">Question Library</h3>
          <h4 className="font-light text-lg mb-3 text-[#111933]">Select and preview questions from your collection</h4>
          <div className="flex items-center mb-6 border-b-2 border-[#11193380]"></div>

          <div className="flex flex-col lg:flex-row gap-6">
            <FiltersSidebar
              filters={uiState.filters}
              toggleFilter={(type, value) => {
                setUiState(prev => ({
                  ...prev,
                  filters: {
                    ...prev.filters,
                    [type]: prev.filters[type].includes(value)
                      ? prev.filters[type].filter(item => item !== value)
                      : [...prev.filters[type], value]
                  },
                  currentPage: 1
                }));
              }}
              clearFilters={() => {
                setUiState(prev => ({
                  ...prev,
                  filters: { level: [], tags: [], section: [] },
                  searchQuery: "",
                  currentPage: 1
                }));
              }}
              availableTags={uiState.availableTags}
              availableSections={uiState.availableSections}
            />

            <div className="flex-1">
              <Header
                totalQuestions={filteredQuestions.length}
                searchQuery={uiState.searchQuery}
                setSearchQuery={(query) => setUiState(prev => ({ ...prev, searchQuery: query }))}
                setIsModalOpen={(value) => toggleModal('isModalOpen', value)}
                setIsSingleQuestionModalOpen={(value) => toggleModal('isSingleQuestionModalOpen', value)}
              />

              {filteredQuestions.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700 mt-4">
                  <strong className="font-medium">No Results: </strong>
                  <span>No questions found.</span>
                </div>
              ) : (
                <QuestionsList
                  questions={questionData.questions}
                  loading={uiState.loading}
                  error={uiState.error}
                  currentQuestions={currentQuestions}
                  setSelectedQuestion={(question) => setQuestionData(prev => ({ ...prev, selectedQuestion: question }))}
                  currentPage={uiState.currentPage}
                  totalPages={totalPages}
                  setCurrentPage={(page) => setUiState(prev => ({ ...prev, currentPage: page }))}
                />
              )}
            </div>
          </div>
        </div>

        {questionData.selectedQuestion && (
          <QuestionDetails
            selectedQuestion={questionData.selectedQuestion}
            setSelectedQuestion={(question) => setQuestionData(prev => ({ ...prev, selectedQuestion: question }))}
            isEditing={modalStates.isEditing}
            setIsEditing={(value) => toggleModal('isEditing', value)}
            handleUpdate={handleUpdate}
            isLoading={uiState.isLoading}
            setShowConfirm={(value) => toggleModal('showConfirm', value)}
          />
        )}

        {modalStates.isModalOpen && (
          <ImportModal
            isModalOpen={modalStates.isModalOpen}
            setIsModalOpen={(value) => toggleModal('isModalOpen', value)}
            handleBulkUpload={handleBulkUpload}
            uploadStatus={uiState.uploadStatus}
          />
        )}

        {modalStates.isSingleQuestionModalOpen && (
          <QuestionModal
            isSingleQuestionModalOpen={modalStates.isSingleQuestionModalOpen}
            setIsSingleQuestionModalOpen={(value) => toggleModal('isSingleQuestionModalOpen', value)}
            singleQuestionData={questionData.singleQuestionData}
            handleSingleQuestionInputChange={(e) => {
              const { name, value } = e.target;
              setQuestionData(prev => ({
                ...prev,
                singleQuestionData: { ...prev.singleQuestionData, [name]: value }
              }));
            }}
            handleSingleQuestionSubmit={handleSingleQuestionSubmit}
            uploadStatus={uiState.uploadStatus}
          />
        )}

        {modalStates.showConfirm && (
          <ConfirmationModal
            showConfirm={modalStates.showConfirm}
            setShowConfirm={(value) => toggleModal('showConfirm', value)}
            handleDelete={handleDelete}
            selectedQuestion={questionData.selectedQuestion}
            setSelectedQuestion={(question) => setQuestionData(prev => ({ ...prev, selectedQuestion: question }))}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
};

export default Mcq;
