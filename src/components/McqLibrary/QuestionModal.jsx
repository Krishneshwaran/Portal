import React from 'react';
import { X } from 'lucide-react';

const QuestionModal = ({ isSingleQuestionModalOpen, setIsSingleQuestionModalOpen, singleQuestionData, handleSingleQuestionInputChange, handleSingleQuestionSubmit, uploadStatus }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-4/5 max-w p-4 overflow-hidden transform transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#000975]">Add New Question</h2>
          <button
            onClick={() => setIsSingleQuestionModalOpen(false)}
            className="text-[#000975] hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSingleQuestionSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#000975] mb-1">
                Question <span className="text-red-500">*</span>
              </label>
              <textarea
                name="question"
                value={singleQuestionData.question}
                onChange={handleSingleQuestionInputChange}
                className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                rows={2}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#000975] mb-1">
                Choice
              </label>
              {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
                <div key={optionKey} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    name={optionKey}
                    value={singleQuestionData[optionKey]}
                    onChange={handleSingleQuestionInputChange}
                    className="flex-1 p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                    required
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#000975] mb-1">
                Select correct answer <span className="text-red-500">*</span>
              </label>
              <select
                name="answer"
                value={singleQuestionData.answer}
                onChange={handleSingleQuestionInputChange}
                className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                required
              >
                <option value="">Select Correct Answer</option>
                {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
                  singleQuestionData[optionKey] && (
                    <option key={optionKey} value={singleQuestionData[optionKey]}>
                      Option {index + 1}: {singleQuestionData[optionKey]}
                    </option>
                  )
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#000975] mb-1">
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <select
                name="level"
                value={singleQuestionData.level}
                onChange={handleSingleQuestionInputChange}
                className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                required
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#000975] mb-1">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={singleQuestionData.tags}
                onChange={handleSingleQuestionInputChange}
                className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                placeholder="e.g., math, algebra, geometry"
              />
              <p className="mt-1 text-sm text-[#000975]">Separate tags with commas</p>
            </div>
          </div>
          <div style={{paddingLeft:'64rem'}}>
            <button
              type="submit"
              className=" p-2  bg-[#FDC500]  rounded-lg border-[#fdc500] bg-opacity-40 text-[#000975] hover:bg-[#FDC500] focus:outline-none focus:ring focus:ring-blue-300"
            >
              Submit
            </button>
          </div>
          {uploadStatus && (
            <div
              className={`p-2 rounded-lg text-sm font-medium text-center shadow-sm ${
                uploadStatus.startsWith("Success")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {uploadStatus}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;