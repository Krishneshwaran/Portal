// LibraryModal.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LibraryModal = ({ onClose }) => {
  const navigate = useNavigate();

  const handleQuestionLibrary = () => {
    navigate('/mcq/McqLibrary');
    onClose(); // Close the modal after navigation
  };

  const handleTestLibrary = () => {
    navigate('/mcq/TestLibrary');
    onClose(); // Close the modal after navigation
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg relative">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose a Library</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={handleQuestionLibrary}
            className="p-10 bg-white border-2 border-amber-400 rounded-lg hover:bg-amber-50 transition-all duration-300 cursor-pointer"
          >
            <div className="text-4xl text-amber-400 mb-4">📚</div>
            <h3 className="text-xl font-semibold text-[#000975] mb-2">Question Library</h3>
            <p className="text-sm text-[#000975]">Access your saved questions library.</p>
          </div>
          <div
            onClick={handleTestLibrary}
            className="p-10 bg-white border-2 border-amber-400 rounded-lg hover:bg-amber-50 transition-all duration-300 cursor-pointer"
          >
            <div className="text-4xl text-amber-400 mb-4">📝</div>
            <h3 className="text-xl font-semibold text-[#000975] mb-2">Test Library</h3>
            <p className="text-sm text-[#000975]">Access your saved test library.</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 bg-red-500 text-white py-2 px-4 rounded-lg shadow hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LibraryModal;
