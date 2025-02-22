import React, { useState } from 'react';
import Pagination from '@mui/material/Pagination';
import { Edit } from 'lucide-react'; // Import an edit icon
import QuestionDetailsMcq from '../../../components/staff/mcq/QuestionDetailsMcq'; // Import the new QuestionDetailsMcq component
import { SlArrowRight } from "react-icons/sl";

const PreviewModal = ({ isOpen, onClose, selectedQuestions, setSelectedQuestions }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // State for confirmation dialog
  const questionsPerPage = 5; // Set to 5 questions per page

  if (!isOpen) return null;

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = selectedQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(selectedQuestions.length / questionsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleEdit = (question) => {
    setSelectedQuestion(question);
    setShowConfirm(true); // Show the confirmation dialog
  };

  const handleUpdate = (questionId) => {
    // Implement the update logic here
    console.log('Updating question with ID:', questionId);
    setIsEditing(false);
    setSelectedQuestion(null);
  };



  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-7xl">
        <h2 className="text-lg font-bold mb-4 text-[#111933]">Preview Selected Questions</h2>
        <h4 className='text-gray-500 mb-6'>Edit and verify the selected questions before proceeding</h4>
        <div className="overflow-x-auto border border-gray shadow rounded-md">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="py-3 px-4 text-left border-r">Question</th>
                <th className="py-3 px-4 text-left border-r">Correct Answer</th>
                <th className="py-3 px-4 text-left border-r">Blooms</th>
                <th className="py-3 px-4 text-left">Edit</th>
              </tr>
            </thead>
            <tbody>
              {currentQuestions.map((question, index) => (
                <tr key={indexOfFirstQuestion + index} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4 text-[#111933]">
                    {question.question}
                  </td>
                  <td className="py-4 px-4 text-[#111933]">
                    {question.correctAnswer}
                  </td>
                  <td className="py-4 px-4 text-[#111933]">LI - Remember</td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleEdit(question)}
                      className="text-[#111933] bg-white border border-[#111933] flex items-center px-4 py-1 rounded-lg"
                    >
                      Edit <SlArrowRight className='inline-flex ml-2' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <Pagination
            className="mt-4 flex justify-center"
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#000975',
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
        )}
        <button
          onClick={onClose}
          className="mt-4 flex mx-auto py-2 px-10 rounded-lg text-sm bg-[#FFCC00] text-[#00296B] border border-[#fdc500] text-[#00975] hover:bg-opacity-80"
        >
          Close
        </button>
      </div>
      {selectedQuestion && (
        <QuestionDetailsMcq
          selectedQuestion={selectedQuestion}
          setSelectedQuestion={setSelectedQuestion}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleUpdate={handleUpdate}
          setSelectedQuestions={setSelectedQuestions}
          isLoading={false} // Set loading state as needed
          setShowConfirm={setShowConfirm} // Pass the function to show the confirmation dialog
        />
      )}
      
    </div>
  );
};

export default PreviewModal;
