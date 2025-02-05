import React from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import Pagination from '@mui/material/Pagination';

const QuestionsList = ({ questions, loading, error, currentQuestions, setSelectedQuestion, currentPage, totalPages, setCurrentPage }) => {
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div className="bg-white p-4 shadow-sm border border-gray-200">
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
            <strong className="font-medium">Error: </strong>
            <span>{error}</span>
          </div>
        ) : (
          <>
            {currentQuestions.map((question, index) => (
              <div
                key={index}
                className="flex items-center bg-white hover:bg-gray-50 transition-all duration-300 cursor-pointer py-4 px-6 mb-4 rounded-md shadow-md"
                onClick={() => setSelectedQuestion(question)}
              >
                <div className="text-left text-sm font-medium text-[#00296B] w-1/12">
                  <strong>{index + 1 + (currentPage - 1) * 10}.</strong>
                </div>
                <div className="text-left text-sm font-medium text-[#00296B] truncate w-7/12">
                  {question.question}
                </div>
                <div className="text-left text-sm text-[#00296B] w-3/12">
                  <strong>Answer:</strong> {question.correctAnswer}
                </div>
                <div className="text-right w-1/12">
                  <ChevronRight className="w-5 h-5 text-[#00296B]" />
                </div>
              </div>
            ))}
            {questions.length > 10 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  count={totalPages}
                  page={currentPage}
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionsList;
