import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditSlidePanel = ({ isOpen, onClose, question, onSave }) => {
  const [editedQuestion, setEditedQuestion] = useState({
    question: '',
    options: [],
    correctAnswer: '',
    blooms: ''
  });

  useEffect(() => {
    if (question) {
      setEditedQuestion({
        ...question,
        options: question.options || []
      });
    }
  }, [question]);

  const optionLabels = ['A.', 'B.', 'C.', 'D.', 'E.', 'F.']; // Labels for options

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-[60]"
          onClick={onClose}
        />
      )}
      
      {/* Slide Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[70] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#111933]">Edit Question</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto h-[calc(100%-140px)]">
          <div className="space-y-6">
            {/* Question */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question
              </label>
              <textarea
                value={editedQuestion.question}
                onChange={(e) => setEditedQuestion({...editedQuestion, question: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111933] focus:border-transparent"
                rows="4"
              />
            </div>

            {/* Options with Labels and Radio Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <div className="space-y-3">
                {editedQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center border p-2 rounded-lg">
                    <span className="font-medium text-lg mr-2">{optionLabels[index]}</span>
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={editedQuestion.correctAnswer === option}
                      onChange={() => setEditedQuestion({...editedQuestion, correctAnswer: option})}
                      className="w-4 h-4 text-[#111933] focus:ring-[#111933] cursor-pointer"
                    />
                    <input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...editedQuestion.options];
                        newOptions[index] = e.target.value;
                        setEditedQuestion({...editedQuestion, options: newOptions});
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111933] focus:border-transparent ml-2"
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Blooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blooms
              </label>
              <input
                value={editedQuestion.blooms}
                onChange={(e) => setEditedQuestion({...editedQuestion, blooms: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#111933] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Footer with Proper Button Alignment */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-200">
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(editedQuestion)}
              className="px-6 py-2 bg-[#111933] text-white rounded-lg hover:bg-opacity-90"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditSlidePanel;
